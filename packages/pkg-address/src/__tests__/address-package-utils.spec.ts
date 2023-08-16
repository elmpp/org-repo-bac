import { AddressPathAbsolute } from "../__types__";
import { Address } from "../address";
import { AddressPackageUtils } from "../address-package";

describe("Address.packageUtils", () => {
  let addr: Address;
  let addressPackageUtils: AddressPackageUtils;

  beforeEach(async () => {
    addr = Address.initialise({ parseParams: {} });
    addressPackageUtils = addr.packageUtils;
  });
  // let addressPackageUtils: AddressPackageUtils

  beforeEach(async () => {
    addr = Address.initialise({ parseParams: {} });
    // addressPackageUtils = addr.packageUtils
  });
  describe("resolve methods", () => {
    it.todo("dunno if worthwhile setting all this up");
  });
  describe("other methods", () => {
    it.only("resolveRoot", () => {
      // const realCwd = process.cwd();
      process.chdir("/");

      const errorPackageRoot = addressPackageUtils.resolveRoot({
        address: addr.parsePackage("@business-as-code/error"),
        projectCwd: addr.parsePath(__dirname) as AddressPathAbsolute,
      })
      console.log(`errorPackageRoot :>> `, errorPackageRoot)
      expect(
        errorPackageRoot
      ).toHaveProperty('original', expect.stringMatching(new RegExp('packages/pkg-error$')))
    });
    it("stringify", () => {
      const descriptor = `@org/name@v1.0.0#b=b&a=a`;
      const addressPackage1 = addr.parsePackage(descriptor);

      expect(addressPackage1.type).toEqual("paramDescriptorPackage");

      const stringified = addr.packageUtils.stringify({
        address: addressPackage1,
      });

      expect(stringified).toEqual(`@org___name@v1.0.0#b=b&a=a`);

      const addressPackage2 = addr.parsePackage(stringified);

      expect(addressPackage2.type).toEqual("paramDescriptorStringifiedPackage");
    });
    it("identToDescriptor", () => {
      // const descriptor = `@org/name@v1.0.0#b=b&a=a`
      const descriptor = `@org/name#b=b&a=a`;
      const addressPackageIdent = addr.parseAsType(
        descriptor,
        "paramIdentPackage"
      );
      expect(addressPackageIdent.type).toEqual("paramIdentPackage");

      // const stringified = addr.packageUtils.stringify({address: addressPackageIdent})

      const addressDescriptor = addr.packageUtils.identToDescriptor({
        address: addressPackageIdent,
        range: "v1.0.0",
      });

      expect(addressDescriptor.address).toEqual(`@org/name@v1.0.0#b=b&a=a`);
      expect(addressDescriptor.addressNormalized).toEqual(
        `@org/name@v1.0.0#a=a&b=b`
      );
      // expect(stringified).toEqual(`@org___name@v1.0.0#b=b&a=a`)

      // const addressPackage2 = addr.parsePackage(stringified)

      // expect(addressPackage2.type).toEqual('paramDescriptorStringifiedPackage')
    });
  });
});
