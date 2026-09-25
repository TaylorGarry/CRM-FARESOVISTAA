import { Request, Response } from 'express';
import cloudinary from '../../config/cloudinary';

// export const uploadItineraryImage = async (

//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     // --- DEBUG LOGS ---
//     console.log('=== CLOUDINARY DEBUG ===');
//     console.log('cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);
//     console.log('api_key set:', !!process.env.CLOUDINARY_API_KEY);
//     console.log('api_secret set:', !!process.env.CLOUDINARY_API_SECRET);
//     console.log(
//       'cloudinary.config().cloud_name:',
//       (cloudinary as any).config().cloud_name
//     );
//     console.log('========================');
//     // --- END DEBUG LOGS ---

//     const file = (req as any).file as
//       | { buffer: Buffer; mimetype: string }
//       | undefined;

//     if (!file) {
//       return res.status(400).json({
//         success: false,
//         message: 'No image file provided',
//       });
//     }

//     if (!file.mimetype.startsWith('image/')) {
//       return res.status(400).json({
//         success: false,
//         message: 'Only image files are allowed',
//       });
//     }

//     const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

//     const result = await cloudinary.uploader.upload(dataUri, {
//       folder: 'faresovista/itinerary',
//       resource_type: 'image',
//     });

//     return res.status(200).json({
//       success: true,
//       url: result.secure_url,
//       public_id: result.public_id,
//       width: result.width,
//       height: result.height,
//     });
//   } catch (error: any) {
//     console.error('Image upload error:', error);
//     return res.status(500).json({
//       success: false,
//       message: error?.message || 'Failed to upload image',
//     });
//   }
// };




export const uploadItineraryImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const files = (req as any).files as
      | { buffer: Buffer; mimetype: string; originalname?: string }[]
      | undefined;
    console.log('[UPLOAD] req.files is:', req.files);
console.log('[UPLOAD] req.file  is:', (req as any).file);
console.log('[UPLOAD] content-type:', req.headers['content-type']);
console.log('[UPLOAD] body keys:', Object.keys(req.body || {}));
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided',
      });
    }

    // Reject any non-image up front
    for (const f of files) {
      if (!f.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          message: 'Only image files are allowed',
        });
      }
    }

    // Upload all files to Cloudinary in parallel
    const uploads = await Promise.all(
      files.map((f) => {
        const dataUri = `data:${f.mimetype};base64,${f.buffer.toString('base64')}`;
        return cloudinary.uploader.upload(dataUri, {
          folder: 'faresovista/itinerary',
          resource_type: 'image',
        });
      })
    );

    return res.status(200).json({
      success: true,
      images: uploads.map((u) => ({
        url: u.secure_url,
        public_id: u.public_id,
        width: u.width,
        height: u.height,
      })),
    });
  } catch (error: any) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to upload images',
    });
  }
};


/* ------------------------------------------------------------------ */
/* Delete a single itinerary image from Cloudinary                     */
/* ------------------------------------------------------------------ */

/**
 * POST /bookings/itinerary/delete-image
 * Body: { public_id: string }
 *
 * Removes an uploaded itinerary image from Cloudinary so it doesn't
 * linger after the user clears it from the editor.
 */
export const deleteItineraryImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { public_id } = req.body || {};

    if (!public_id || typeof public_id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'public_id is required',
      });
    }

    // Safety: only allow deleting inside our own folder
    if (!public_id.startsWith('faresovista/itinerary/')) {
      return res.status(403).json({
        success: false,
        message: 'Refusing to delete a resource outside the itinerary folder',
      });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: 'image',
      invalidate: true,
    });

    // Cloudinary returns { result: 'ok' | 'not found' }
    if (result.result !== 'ok' && result.result !== 'not found') {
      return res.status(500).json({
        success: false,
        message: `Cloudinary returned: ${result.result}`,
      });
    }

    return res.status(200).json({
      success: true,
      message:
        result.result === 'ok'
          ? 'Image deleted'
          : 'Image already removed from Cloudinary',
      public_id,
    });
  } catch (error: any) {
    console.error('Image delete error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to delete image',
    });
  }
};