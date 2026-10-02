// ============================================
// SHAH GEE CLOTH & BOUTIQUE HOUSE
// Cloudinary Configuration
// ============================================

const CLOUDINARY_CLOUD_NAME = 'mo7lzjdjn';
const CLOUDINARY_UPLOAD_PRESET = 'shahgee_unsigned';

// ============================================
// IMAGE UPLOAD
// ============================================
async function uploadImageToCloudinary(file) {
    if (!file) return { success: false, error: 'Koi file nahi mili' };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (data.secure_url) {
            return {
                success: true,
                url: data.secure_url,
                publicId: data.public_id
            };
        } else {
            return {
                success: false,
                error: data.error?.message || 'Upload fail'
            };
        }
    } catch (err) {
        console.error('Image upload error:', err);
        return { success: false, error: err.message };
    }
}

// ============================================
// VIDEO UPLOAD
// ============================================
async function uploadVideoToCloudinary(file) {
    if (!file) return { success: false, error: 'Koi file nahi mili' };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        const data = await response.json();

        if (data.secure_url) {
            return {
                success: true,
                url: data.secure_url,
                publicId: data.public_id
            };
        } else {
            return {
                success: false,
                error: data.error?.message || 'Upload fail'
            };
        }
    } catch (err) {
        console.error('Video upload error:', err);
        return { success: false, error: err.message };
    }
}

// ============================================
// FILE SELECT HELPER (UI)
// ============================================
function pickImageFile() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => resolve(e.target.files[0]);
        input.click();
    });
}

function pickVideoFile() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e) => resolve(e.target.files[0]);
        input.click();
    });
}