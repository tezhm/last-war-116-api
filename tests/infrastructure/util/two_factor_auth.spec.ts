import { assert } from "chai";
import { TwoFactorAuth } from "../../../src/infrastructure/util/two_factor_auth";

describe("Beta Controller Tests", () => {
    let testClass: TwoFactorAuth;

    beforeEach(() => {
        testClass = new TwoFactorAuth();
    });

    describe("verifyOtpAuthCode", () => {
        it("Should pass verification", async () => {
            const testCode = "otpauth://totp/www.lastwar116.com:someuser?algorithm=SHA1&digits=6&period=30&issuer=www.lastwar116.com&secret=NICMW2OW4BTYLF64HJATK2Y";
            assert.isTrue(testClass.verifyOtpAuthCode(testCode));
        });

        it("Should pass verification with url encoded account", async () => {
            const testCode = "otpauth://totp/www.lastwar116.com:%E7%9A%84%E7%9A%84%E7%9A%84%E7%9A%84%E7%9A%84%E7%9A%84%E7%9A%84%E7%9A%84%E7%9A%84?algorithm=SHA1&digits=6&period=30&issuer=www.lastwar116.com&secret=NICMW2OW4BTYLF64HJATK2Y";
            assert.isTrue(testClass.verifyOtpAuthCode(testCode));
        });

        it("Should fail verification with invalid path", async () => {
            const testCode = "otauth://totp/www.lastwar116.com:someuser?algorithm=SHA1&digits=6&period=30&issuer=www.lastwar116.com&secret=NICMW2OW4BTYLF64HJATK2Y";
            assert.isFalse(testClass.verifyOtpAuthCode(testCode));
        });

        it("Should fail verification with invalid label", async () => {
            const testCode = "otpauth://totp/www.lastwar116.co:someuser?algorithm=SHA1&digits=6&period=30&issuer=www.lastwar116.com&secret=NICMW2OW4BTYLF64HJATK2Y";
            assert.isFalse(testClass.verifyOtpAuthCode(testCode));
        });

        it("Should fail verification with invalid account", async () => {
            const testCode = "otpauth://totp/www.lastwar116.com:some user?algorithm=SHA1&digits=6&period=30&issuer=www.lastwar116.com&secret=NICMW2OW4BTYLF64HJATK2Y";
            assert.isFalse(testClass.verifyOtpAuthCode(testCode));
        });

        it("Should fail verification with invalid algorithm", async () => {
            const testCode = "otpauth://totp/www.lastwar116.com:someuser?algorithm=SH1&digits=6&period=30&issuer=www.lastwar116.com&secret=NICMW2OW4BTYLF64HJATK2Y";
            assert.isFalse(testClass.verifyOtpAuthCode(testCode));
        });

        it("Should fail verification with invalid digits", async () => {
            const testCode = "otpauth://totp/www.lastwar116.com:someuser?algorithm=SHA1&digits=3&period=30&issuer=www.lastwar116.com&secret=NICMW2OW4BTYLF64HJATK2Y";
            assert.isFalse(testClass.verifyOtpAuthCode(testCode));
        });

        it("Should fail verification with invalid period", async () => {
            const testCode = "otpauth://totp/www.lastwar116.com:someuser?algorithm=SHA1&digits=6&period=31&issuer=www.lastwar116.com&secret=NICMW2OW4BTYLF64HJATK2Y";
            assert.isFalse(testClass.verifyOtpAuthCode(testCode));
        });

        it("Should fail verification with invalid issuer", async () => {
            const testCode = "otpauth://totp/www.lastwar116.com:someuser?algorithm=SHA1&digits=6&period=30&issuer=www.lastwr116.com&secret=NICMW2OW4BTYLF64HJATK2Y";
            assert.isFalse(testClass.verifyOtpAuthCode(testCode));
        });

        it("Should fail verification with invalid secret", async () => {
            const testCode = "otpauth://totp/www.lastwar116.com:someuser?algorithm=SHA1&digits=6&period=30&issuer=www.lastwar116.com&secret=asdasd";
            assert.isFalse(testClass.verifyOtpAuthCode(testCode));
        });
    });
});
