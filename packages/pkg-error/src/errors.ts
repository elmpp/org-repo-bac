import { MessageName } from "./message-name";
import os from "os";

/**
 Subclasses of builtins in TS don't work with Instanceof - https://tinyurl.com/yy98e53g / https://tinyurl.com/y5qjen4t
 Includes check for custom ts-node error that presents as a plain object (ts-node strangeness when modules loaded via es5 require()
 in configuration.ts plugins) - https://tinyurl.com/y2jlrnaz
 */
export function assertIsError(errorLike: any): errorLike is Error {
  return (
    errorLike instanceof Error ||
    // (errorLike?.stack && errorLike?.message) ||
    !!errorLike?.message ||
    !!(errorLike?.diagnosticText && errorLike?.diagnosticCodes)
  );
}
export function assertIsBacError<
  Extra = undefined,
  Code extends MessageName = MessageName
>(errorLike: any): errorLike is BacError<Code, Extra> {
  return assertIsError(errorLike) && errorLike instanceof BacError;
}
export function assertIsBacWrappedError<
  Extra = undefined,
  Code extends MessageName = MessageName
>(errorLike: any): errorLike is BacErrorWrapper<Code, Extra> {
  return assertIsError(errorLike) && !!((errorLike as BacErrorWrapper).wrapped);
}

// https://github.com/arcanis/clipanion/blob/665d2ab3125be0f247009799d01da9ca5f6fd24f/sources/errors.ts#L3
export type ClipanionErrorMeta =
  | {
      type: `none`;
    }
  | {
      type: `usage`;
    };

// type ErrorTypeUnion =
//   /** wrong options etc */
//   | 'clipanionUsage'
//   /** been handled by clipanion error handler below */
//   | 'clipanionGeneral'
// type ErrorTypeOrExitCode = 'clipanionUsage' | 'clipanionGeneral' | ExitCode
export class BacError<
Code extends MessageName = MessageName,
Extra = unknown,
> extends Error {
  public reportCode: Code;
  public clipanion?: ClipanionErrorMeta; // for compatibility with Clipanion
  // public type?: ErrorTypeUnion
  // public exitCode?: ExitCode
  public messageRaw: string;
  public stackRaw?: string;
  public extra?: Extra;

  // static isSuccessError(err: Error) {
  //   if ((err as BacError)?.reportCode) {
  //     return [MessageName.DOCTOR_COMPLETE, MessageName.ACTION_SUCCESS].includes((err as BacError)?.reportCode)
  //   }
  //   return false
  // }

  static fromError<Extra = undefined>(
    err: string | Error,
    options?: { reportCode?: MessageName.UNNAMED; extra?: Extra, messagePrefix?: string }
  ): BacError<MessageName.UNNAMED, Extra>;
  static fromError<Extra = undefined>(
    err: string,
    options?: { reportCode?: MessageName.UNNAMED; extra?: Extra, messagePrefix?: string }
  ): BacError<MessageName.UNNAMED, Extra>;
  static fromError<Extra = undefined, Code extends MessageName = MessageName.UNNAMED>(
    err: BacError,
    options?: { reportCode?: Code; extra?: Extra, messagePrefix?: string }
  ): BacError<Code, Extra>;
  static fromError<Extra = undefined, Code extends MessageName = MessageName.UNNAMED>(
    err: BacErrorWrapper,
    options?: { reportCode?: Code; extra?: Extra, messagePrefix?: string }
  ): BacErrorWrapper<Code, Extra>;
  static fromError<Extra = undefined, Code extends MessageName = MessageName.UNNAMED>(
    err: Error,
    options?: { reportCode?: Code; extra?: Extra, messagePrefix?: string }
  ): BacError<Code, Extra>;
  static fromError<Extra = undefined, Code extends MessageName = MessageName.UNNAMED>(
    errParam: BacError | BacErrorWrapper | Error | string,
    options: { reportCode?: Code; extra?: Extra, messagePrefix?: string } = {}
  ): BacError<Code, Extra> | BacErrorWrapper<Code, Extra> {

    const { reportCode, extra, messagePrefix } = options;
    let err = errParam

    if (typeof err === 'string') {
      err = new BacError<Code, Extra>(reportCode ?? MessageName.UNNAMED as Code, err)
    }
    else if (
      assertIsBacWrappedError<Extra, Code>(err) ||
      assertIsBacError<Extra, Code>(err)
    ) {
      if (reportCode) err.reportCode = reportCode;
      if (extra) err.extra = extra;

      // console.log(`err :>> `, Object.keys(err))
      return err;
    }
    const nextMessage = messagePrefix ? BacErrorWrapper.inlineWrapError(messagePrefix, err) : err.message
    const nextErr = new BacError<Code, Extra>(
      reportCode ?? (MessageName.UNNAMED as Code),
      nextMessage,
      { extra }
    );
    // @ts-ignore
    nextErr.stack = err.stack
    return nextErr
  }

  static getMessageForError(err: string | BacError | BacErrorWrapper | Error): string {
    if (typeof err === 'string') {
      return err
    }
    if (assertIsBacWrappedError(err)) {
      return err.stack
    }
    // console.log(`err :>> `, assertIsBacWrappedError(err), assertIsBacError(err), assertIsError(err), err?.stack, err)
    if (assertIsBacError(err)) {
      return BacError.formatMessageName(err.reportCode, err.stack);
    }
    if (err.stack) {
      return err.stack
    }

    console.log(`Object.keys(err) :>> `, Object.keys(err))

    throw new Error('WUT')
  }

  // static prefixMessage(err: Error, prefixMessage: string) {
  //   err.message = `${prefixMessage}${err.message}`;
  // }

  constructor(code: Code, message: string, { extra }: { extra?: Extra } = {}) {
    // super(BacError.formatMessageName(code, message))
    super(message);
    this.messageRaw = message;
    this.reportCode = code;
    if (extra) {
      this.extra = extra;
    }
    // this.type = type

    // switch (type) {
    //   case 'clipanionUsage':
    //     // this.clipanion = {type: 'usage'} // this does not work as expected - it hides the error message. @todo
    //   case 'clipanionGeneral':
    //     // this.clipanion = {type: 'usage'} // this does not work as expected - it hides the error message. @todo
    //   case undefined:
    //   default:
    //     this.type = type
    // }

    Object.setPrototypeOf(this, BacError.prototype);
  }

  override get message(): string {
    // if (BacError.isSuccessError(this)) {
    //   return ''
    // }
    return BacError.formatMessageName(this.reportCode, this.message);
    // return this.message
  }
  override get stack(): string {
    // if (BacError.isSuccessError(this)) {
    //   return ''
    // }
    return this.stack;
  }

  private static formatMessageName(code: MessageName, message: string) {
    if (!code) {
      // standard UNNAMED need not hyperlink
      return message;
    }
    return `Error code '${code}'. More info at https://monotonous.org/advanced/error-codes#${code}--- \n${message}`;
  }
}

// /**
//  Error type that can carry state of a failed process. This is required when running
//  with foreach command
//  */
// export class MntExecError extends Error {

//   public exitCode: number
//   public signal?: NodeJS.Signals

//   constructor(exitCode: MessageName, message: string, signal?: NodeJS.Signals) {
//     super(message)
//     this.exitCode = exitCode
//     this.signal = signal

//     Object.setPrototypeOf(this, MntExecError.prototype);
//   }
// }

// export class MntSuccess extends BacError {
//   public reportCode: MessageName
//   public clipanion: ClipanionErrorMeta = {type: 'none'}

//   constructor(code: MessageName, message: string, type?: ErrorTypeOrExitCode) {
//     super(code, message, type)
//     Object.setPrototypeOf(this, MntSuccess.prototype);
//   }
// }

// /**
//  Specific Error type to enable hook intervention, in this case probably by the Doctor
//  */
// export class RemediableError extends BacError {
//   public data: any

//   constructor(code: MessageName, message: string, data?: any) {
//     super(code, message)
//     this.data = data
//   }
// }

export class BacErrorWrapper<
Code extends MessageName = MessageName,
Extra = undefined,
> extends BacError<Code, Extra> {
  public wrapped: Error;

  // constructor(code: MessageName, message: string, error: Error, typeOrExitCode?: ErrorTypeOrExitCode) {
  constructor(
    code: Code | undefined,
    message: string,
    error: Error,
    options: { extra?: Extra } = {}
  ) {
    // super(`${message}'.\nRethrowing the error: "${error.message}"`)
    const nextStack = BacErrorWrapper.inlineWrapError(message, error);
    super((code ?? (error as BacError).reportCode ?? MessageName.UNNAMED) as Code, nextStack, options);
    this.wrapped = error;
    if (error.stack) {
      // @ts-ignore
      this.stack = nextStack;
    }
    Object.setPrototypeOf(this, BacErrorWrapper.prototype);
  }

  static inlineWrapError(message: string, wrappable: string | Error = message) {
    if (assertIsError(wrappable)) {
      wrappable = wrappable.stack ?? wrappable.message;
    }
    const lines = wrappable.split(os.EOL);
    return `Error: ${message}\nWrapped error:\n${lines
      .map((line) => `  ${line}`)
      .join(os.EOL)}`;
  }
}
