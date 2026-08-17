import test from "node:test";
import assert from "node:assert/strict";
import { validateUploadFile } from "./file-validation.ts";

/* A File-shaped object is all validateUploadFile reads. */
const f = (name: string, type: string, size = 2048) =>
  ({ name, type, size }) as unknown as File;

test("an iPhone photo with no extension in its name is accepted", () => {
  /* iOS hands Safari names like "image" with no dot. split('.').pop() then
     returns "image", which was not on the extension list, so every photo from
     Dvir's phone was rejected while a plain .jpg posted by curl went through. */
  const r = validateUploadFile(f("image", "image/jpeg"));
  assert.equal(r.ok, true);
  assert.equal(r.safeExt, "jpg", "extension derived from the MIME type");
});

test("HEIC straight from an iPhone", () => {
  assert.equal(validateUploadFile(f("IMG_0421.HEIC", "image/heic")).ok, true);
  assert.equal(validateUploadFile(f("image", "image/heic")).safeExt, "heic");
});

test("a real filename still wins over the MIME guess", () => {
  const r = validateUploadFile(f("chuppah.jpeg", "image/jpeg"));
  assert.equal(r.safeExt, "jpeg");
});

test("video is accepted only when the caller allows it", () => {
  assert.equal(validateUploadFile(f("clip.mov", "video/quicktime")).ok, true);
  assert.equal(validateUploadFile(f("clip.mov", "video/quicktime"), { allowVideo: false }).ok, false);
  assert.equal(validateUploadFile(f("v", "video/quicktime")).safeExt, "mov");
});

test("what is genuinely not an image is still refused", () => {
  /* Loosening the extension check must not loosen the type check. */
  assert.equal(validateUploadFile(f("payload.jpg", "application/pdf")).ok, false);
  assert.equal(validateUploadFile(f("x.exe", "application/octet-stream")).ok, false);
  assert.equal(validateUploadFile(f("empty.jpg", "image/jpeg", 0)).ok, false);
});
