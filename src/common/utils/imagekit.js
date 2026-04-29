import ImageKit from "imagekit";
import config from "../config/connection.js";
import ApiError from "./api-error.js";

let imageKitClient = null;

const hasImageKitConfig = () =>
  Boolean(
    config.imageKit.publicKey &&
      config.imageKit.privateKey &&
      config.imageKit.urlEndpoint,
  );

const getImageKitClient = () => {
  if (!hasImageKitConfig()) {
    return null;
  }

  if (!imageKitClient) {
    imageKitClient = new ImageKit({
      publicKey: config.imageKit.publicKey,
      privateKey: config.imageKit.privateKey,
      urlEndpoint: config.imageKit.urlEndpoint,
    });
  }

  return imageKitClient;
};

export const uploadImageToImageKit = async (file, fileNamePrefix = "profile") => {
  if (!file) {
    return null;
  }

  const client = getImageKitClient();

  if (!client) {
    throw ApiError.badRequest(
      "ImageKit is not configured. Add IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT.",
    );
  }

  const safeName = `${fileNamePrefix}-${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;

  const result = await client.upload({
    file: file.buffer,
    fileName: safeName,
    folder: "/oidc-demo",
    useUniqueFileName: true,
  });

  return {
    url: result.url,
    fileId: result.fileId,
    name: result.name,
  };
};

export default uploadImageToImageKit;
