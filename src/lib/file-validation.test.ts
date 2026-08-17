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

test("an Android pick with an empty MIME is accepted on its filename", () => {
  /* The mirror image of the iPhone case. Chrome on Android, and Google Photos
     in particular, hands over files with type "" or application/octet-stream
     while the name is perfectly good — so trusting only the MIME would have
     traded one broken phone for the other. */
  assert.equal(validateUploadFile(f("IMG_20260824_213004.jpg", "")).ok, true);
  assert.equal(validateUploadFile(f("PXL_20260824.jpg", "application/octet-stream")).ok, true);
  assert.equal(validateUploadFile(f("VID_20260824.mp4", "")).ok, true);
  assert.equal(validateUploadFile(f("IMG_20260824.jpg", "")).safeExt, "jpg");
});

test("a type that positively says otherwise is still refused", () => {
  /* Only an absent or generic type falls through to the name. A PDF announces
     itself as application/pdf and is not unknown. */
  assert.equal(validateUploadFile(f("holiday.jpg", "application/pdf")).ok, false);
  assert.equal(validateUploadFile(f("x.jpg", "text/html")).ok, false);
  assert.equal(validateUploadFile(f("nothing", "")).ok, false, "no MIME and no usable name");
});
