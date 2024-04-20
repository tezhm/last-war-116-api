import { sign, verify } from "jsonwebtoken";
import { jwt } from "../../config/jwt";
import { pbkdf2 } from "crypto";

export class Authentication {
    public static encodeToken(accessToken: string): string {
        const now = Math.floor(Date.now() / 1000);
        const jwtToken = sign({ accessToken, timestamp: now }, jwt.JWT_SECRET);
        return Buffer.from(jwtToken).toString("base64");
    }

    public static decodeToken(token: string): string|null {
        const decoded = Buffer.from(token, "base64").toString("utf-8");
        const jwtToken = verify(decoded, jwt.JWT_SECRET);

        if (typeof jwtToken === "string") {
            return null;
        }

        return jwtToken.accessToken;
    }

    public static async hashPassword(password: string, salt: string, iterations: number): Promise<string> {
        return new Promise<string>((res, rej) => {
            pbkdf2(password, salt, iterations, 64, "sha512", (err, derivedKey) => {
                if (err) {
                    rej(err);
                    return;
                }

                res(derivedKey.toString("hex"));
            });
        });
    }
}
