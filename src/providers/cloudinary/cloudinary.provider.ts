import { v2 } from 'cloudinary';
import { env } from 'src/config/env-validation';

export const CloudinaryProvider = {
  provide: 'CLOUDINARY_CONFIG',
  useFactory: () => {
    const cloudinaryUrl = env.CLOUDINARY_URL;
    const url = new URL(cloudinaryUrl);

    return v2.config({
      cloud_name: url.hostname,
      api_key: url.username,
      api_secret: url.password,
    });
  },
};
