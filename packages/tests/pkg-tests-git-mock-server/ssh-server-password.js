#!/usr/bin/env node
const { spawn, spawnSync } = require("child_process");
var crypto = require("crypto");
var fs = require("fs");
var path = require("path");
const { constants } = require("@business-as-code/core");

var buffersEqual = require("buffer-equal-constant-time");
var fixturez = require("fixturez");
var ssh2 = require("ssh2");

var config = {
  // root: path.resolve(process.cwd(), process.env.GIT_SSH_PUBKEY_MOCK_SERVER_ROOT || '.'),
  root: path.resolve(process.cwd(), constants.GIT_SSH_PUBKEY_MOCK_SERVER_ROOT),
  glob: "*",
  route: process.env.GIT_SSH_MOCK_SERVER_ROUTE || "/",
};

const keyPaths = {
  pub: path.join(config.root, 'id_rsa.pub'),
  prv: path.join(config.root, 'id_rsa'),
}

// https://github.com/mscdex/ssh2#password-and-public-key-authentication-and-non-interactive-exec-command-execution
function checkValue(input, allowed) {
  const autoReject = input.length !== allowed.length;
  if (autoReject) {
    // Prevent leaking length information by always making a comparison with the
    // same input when lengths don't match what we expect ...
    allowed = input;
  }
  const isMatch = crypto.timingSafeEqual(input, allowed);
  return !autoReject && isMatch;
}

// console.log(`config :>> `, config)
// console.log(`keyPaths :>> `, keyPaths)

new Promise((resolve, reject) => {
  if (
    (process.env?.GIT_SSH_MOCK_SERVER_PUBKEY ?? "false").toUpperCase() ===
      "true" ||
    (process.env?.GIT_SSH_MOCK_SERVER_PASSWORD ?? "false").toUpperCase() ===
      "true"
  ) {
    throw new Error(
      `ssh-server-password is not intended for private or password access!!. '${process.env.GIT_SSH_MOCK_SERVER_PUBKEY}', '${process.env.GIT_SSH_MOCK_SERVER_PASSWORD}'`
    );
  }

  try {
    let key = fs.readFileSync(keyPaths.prv);
    let pubKey = fs.readFileSync(keyPaths.pub);
    return resolve({ key, pubKey });
  } catch (err) {
    try {
      if (!fs.existsSync(path.join(config.root, 'id_rsa'))) {
        console.warn(
          `REGENERATING KEYPAIR TO '${JSON.stringify(
            keyPaths
          )}'. SHOULD ONLY HAPPEN FIRST EVER RUN!. ssh-server-password`
        );
        // Note: PEM is to workaround https://github.com/mscdex/ssh2/issues/746
        let proc = spawnSync('ssh-keygen', ['-m', 'PEM', '-C', '"git-ssh-mock-server@localhost"', '-N', '""', '-f', 'id_rsa', '-t', 'ed25519'], { // FIXES https://tinyurl.com/24lqexhx
        // let proc = spawnSync('ssh-keygen', ['-m', 'PEM', '-C', '"git-ssh-mock-server@localhost"', '-N', '""', '-f', 'id_rsa', '-t', 'ed25519'], { // FIXES https://tinyurl.com/24lqexhx
        // let proc = spawnSync('ssh-keygen', ['-m', 'PEM', '-C', '"git-ssh-mock-server@localhost"', '-N', '""', '-f', 'id_rsa', '-t', 'rsa'], {
        // let proc = spawnSync("ssh-keygen", ["-m", "PEM", "-C", '"git-ssh-mock-server@localhost"', "-N", '""', "-f", "id_rsa"], {
          cwd: config.root,
          shell: true,
          stdio: 'inherit',
          }
        );
        // console.log(proc.stdout.toString("utf8"));
        console.log(`fs.existsSync(path.join(config.root, 'id_rsa')) :>> `, fs.existsSync(path.join(config.root, 'id_rsa')))
      }

      let key = fs.readFileSync(path.join(config.root, "id_rsa"));
      let pubKey = fs.readFileSync(path.join(config.root, "id_rsa.pub"));
      return resolve({ key, pubKey });
    } catch (err) {
      reject(err);
    }
  }
}).then((keypair) => {
  if (process.argv[2] === "exportKeys") {
    console.error(`Not supported. Do 'ssh-add ${config.root}/id_rsa' / 'ssh-add -d ${config.root}/id_rsa'`)
    process.exit(1);
    // fs.writeFileSync(path.join(process.cwd(), 'id_rsa'), keypair.key, { mode: 0o600, flag: 'wx' })
    // fs.writeFileSync(path.join(process.cwd(), 'id_rsa.pub'), keypair.pubKey, { mode: 0o600, flag: 'wx' })
    // process.exit()
  }

  // console.log(`keypair :>> `, keypair)
  var pubKey = ssh2.utils.parseKey(keypair.pubKey);

  console.log(`public key:  :>> `, keypair.pubKey.toString());
  // console.log(`parsed pubKey :>> `, pubKey)

  // var pubKey = ssh2.utils.genPublicKey(ssh2.utils.parseKey(keypair.pubKey))
  var f = fixturez(config.root, { root: process.cwd(), glob: config.glob });

  if (process.env.GIT_SSH_MOCK_SERVER_PASSWORD) {
    throw new Error(`process.env.GIT_SSH_MOCK_SERVER_PASSWORD must be present`)
  }
  const PASSWORD_BUFFER = Buffer.from(
    process.env.GIT_SSH_MOCK_SERVER_PASSWORD || ""
  );

  /** SSH2 example for ssh server - https://tinyurl.com/2anfjnh7 */
  new ssh2.Server(
    {
      hostKeys: [keypair.key],
      // algorithms: {
      //   serverHostKey: [ 'ssh-rsa', 'ssh-dss' ], // defaults here - https://tinyurl.com/25agn2bf
      // },
      debug: console.log,
    },
    function (client) {
      console.log("client connected");
      client
        .on("authentication", function (ctx) {
          if (ctx.method === "none") {
            console.log(
              `attempting no-authentication login :>> '${process.env.GIT_SSH_MOCK_SERVER_PASSWORD}' :: '${process.env.GIT_SSH_MOCK_SERVER_PUBKEY}'`
            );
          }
          if (ctx.method === "publickey") {
            console.log(
              `attempting publickey login :>> '${
                process.env.GIT_SSH_MOCK_SERVER_PUBKEY
              }' :: '${ctx.key.algo}' :: '${
                pubKey.type
              }' :: '${ctx.key?.data?.toString()}' :: '${pubKey
                .getPublicSSH()
                .toString()}'`
            );
          }
          if (ctx.method === "password") {
            console.log(
              `attempting password login :>> '${Buffer.from(
                ctx.password || ""
              ).toString()}' :: '${PASSWORD_BUFFER}' :: '${
                process.env.GIT_SSH_MOCK_SERVER_PASSWORD
              }'`
            );
          }

          // console.log(`ctx.method :>> `, ctx.method)

          if (
            ctx.method === "none" &&
            !process.env.GIT_SSH_MOCK_SERVER_PASSWORD &&
            !process.env.GIT_SSH_MOCK_SERVER_PUBKEY
          ) {
            ctx.accept();
          } else if (
            ctx.method === "password" &&
            process.env.GIT_SSH_MOCK_SERVER_PASSWORD &&
            // After much thought... screw usernames.
            buffersEqual(Buffer.from(ctx.password || ""), PASSWORD_BUFFER)
          ) {
            ctx.accept();
          } else if (
            ctx.method === "publickey" &&
            ctx.key.algo === pubKey.type &&
            process.env.GIT_SSH_MOCK_SERVER_PUBKEY &&
            checkValue(ctx.key.data, pubKey.getPublicSSH())
          ) {
            // console.log(`ctx :>> `, ctx)
            if (ctx.signature) {
              // var verifier = crypto.createVerify(ctx.sigAlgo)
              // verifier.update(ctx.blob)
              // if (verifier.verify(pubKey.publicOrig, ctx.signature)) ctx.accept()
              if (pubKey.verify(ctx.blob, ctx.signature)) {
                ctx.accept();
              } else {
                ctx.reject();
              }
            } else {
              // if no signature present, that means the client is just checking
              // the validity of the given public key
              ctx.accept();
            }
          } else {
            // console.error(`rejecting authentication because method is not known`)
            ctx.reject();
          }
        })
        .on("ready", function () {
          console.log("client authenticated");

          client.on("session", function (accept, reject) {
            console.log("client session");
            var session = accept();
            session.once("exec", function (accept, reject, info) {
              console.log(info.command);
              let [_, command, gitdir] =
                info.command.match(/^([a-z-]+) '(.*)'/);
              // Only allow these two commands to be executed
              if (
                command !== "git-upload-pack" &&
                command !== "git-receive-pack"
              ) {
                console.log("invalid command:", command);
                return reject();
              }
              if (gitdir !== path.posix.normalize(gitdir)) {
                // something fishy about this filepath
                console.log("suspicious file path:", gitdir);
                return reject();
              }

              // Do copy-on-write trick for git push
              let fixtureName = path.posix.basename(gitdir);
              let fulldir;
              if (command === "git-upload-pack") {
                fulldir = f.find(fixtureName);
              } else if (command === "git-receive-pack") {
                fulldir = f.copy(fixtureName);
              }

              try {
                fs.accessSync(fulldir);
              } catch (err) {
                console.log(fulldir + " does not exist.");
                return reject();
              }

              var stream = accept();
              console.log("exec:", command, gitdir);
              console.log("actual:", command, fulldir);
              let proc = spawn(command, [fulldir]);
              stream.exit(0); // always set a successful exit code
              stream.pipe(proc.stdin);
              proc.stdout.pipe(stream);
              proc.stderr.pipe(stream.stderr);
            });
          });
        })
        .on("end", function () {
          console.log("client disconnected");
        });
      // .on('error', function (err) {
      //   console.error(`err :>> `, err)
      //   throw err
      //   // process.exit(1)
      // })
    }
    // ).listen(process.env.GIT_SSH_PASSWORD_MOCK_SERVER_PORT || 2222, '127.0.0.1', function () {
  ).listen(
    parseInt(process.env.GIT_SSH_PASSWORD_MOCK_SERVER_PORT ||
      constants.GIT_SSH_PASSWORD_MOCK_SERVER_PORT, 10),
    "127.0.0.1",
    function () {
      console.log(
        "Listening on port " + process.env.GIT_SSH_PASSWORD_MOCK_SERVER_PORT ||
          constants.GIT_SSH_PASSWORD_MOCK_SERVER_PORT
      );
    }
  );
  // bun incompatible with node net:Server - https://github.com/oven-sh/bun/issues/4540
  // ).listen({
  //   port: process.env.GIT_SSH_PASSWORD_MOCK_SERVER_PORT || constants.GIT_SSH_PASSWORD_MOCK_SERVER_PORT,
  //   host: '127.0.0.1',
  //   debug: console.log,
  // }, function () {
  //   console.log('Listening on port ' + process.env.GIT_SSH_PASSWORD_MOCK_SERVER_PORT || constants.GIT_SSH_PASSWORD_MOCK_SERVER_PORT)
  // })
});
