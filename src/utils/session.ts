import { randomUUID } from "crypto";

export namespace SessionUtil {
  export let id: string = (() => {
    return randomUUID();
  })();
}
