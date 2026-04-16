import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";

@Injectable({
  providedIn: "root",
})
export class EncryptDecryptService {
  private originalKey = "mustbe16byteskey";
  private encodedKey = btoa(this.originalKey);

  constructor() { }

  /*=============== Decrypt Data Method ===============*/
  decrypt(encryptedText: string) {
    const userInfo = JSON.parse(localStorage.getItem("currentUser"));
    let encodedKey = "";
    if (userInfo?.settings?.length) {
      const originalKey = userInfo?.settings.find(
        (x) => x?.key === "cipherKey"
      );
      encodedKey = btoa(originalKey?.value);
    }
    const encryptedBase64Key = encodedKey;
    const parsedBase64Key = CryptoJS.enc.Base64.parse(encryptedBase64Key);
    const encryptedCipherText = encryptedText;

    const decryptedData = CryptoJS.AES.decrypt(encryptedCipherText, parsedBase64Key, {
      mode: CryptoJS.mode.ECB,
      keySize: 256 / 32,
      padding: CryptoJS.pad.Pkcs7,
    });

    const decryptedText = decryptedData.toString(CryptoJS.enc.Utf8);
    return decryptedText;
  }

  /*=============== Encrypt Data Method ===============*/
  // encrypt(decryptedText: string) {
  //   const encryptedBase64Key = this.encodedKey;
  //   const encrypted = CryptoJS.AES.encrypt(decryptedText, encryptedBase64Key);
  //   return encrypted.toString();
  // }

  encrypt(decryptedText: string) {
    const userInfo = JSON.parse(localStorage.getItem("currentUser"));
    let encodedKey = "";
    if (userInfo?.settings?.length) {
      const originalKey = userInfo?.settings.find(
        (x) => x?.key === "cipherKey"
      );
      encodedKey = btoa(originalKey?.value);
    }
    const encryptedBase64Key = encodedKey;
    const parsedBase64Key = CryptoJS.enc.Base64.parse(encryptedBase64Key);

    const encryptedData = CryptoJS.AES.encrypt(decryptedText, parsedBase64Key, {
      mode: CryptoJS.mode.ECB,
      keySize: 256 / 32,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encryptedData.toString();
  }
}
