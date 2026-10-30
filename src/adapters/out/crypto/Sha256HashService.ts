import { createHash } from "node:crypto";
import { IHashService } from "../../../core/ports/services";

export class Sha256HashService implements IHashService {
  sha256(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }
}
