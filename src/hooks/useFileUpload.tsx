import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores';
import { toast } from 'sonner';
import { handleSupabaseError, addBreadcrumb } from '@/lib/sentry';

export interface UploadOptions {
  bucket: string;
  folder?: string;
  upsert?: boolean;
  contentType?: string;
}

export const useFileUpload = () => {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (
    file: File,
    options: UploadOptions
  ): Promise<string> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    setUploading(true);
    
    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = options.folder 
        ? `${options.folder}/${user.id}/${fileName}`
        : `${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: options.upsert || false,
          contentType: options.contentType || file.type,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        
        // Sentry로 에러 리포팅
        handleSupabaseError(error, {
          context: 'fileUpload',
          bucket: options.bucket,
          filePath,
          fileSize: file.size,
          fileType: file.type,
          userId: user.id,
        });
        
        throw new Error(error.message);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      // 성공 시 브레드크럼 추가
      addBreadcrumb(
        `File uploaded successfully: ${fileName}`,
        'storage',
        'info'
      );

      return publicUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const uploadProfileImage = async (file: File): Promise<string> => {
    return uploadFile(file, {
      bucket: 'avatars',
      folder: 'profiles',
      upsert: true,
      contentType: file.type,
    });
  };

  const uploadProjectImage = async (file: File): Promise<string> => {
    return uploadFile(file, {
      bucket: 'projects',
      folder: 'images',
      upsert: false,
      contentType: file.type,
    });
  };

  const uploadImage = async (file: File, folder: string = 'general'): Promise<string> => {
    return uploadFile(file, {
      bucket: 'projects',
      folder,
      upsert: false,
      contentType: file.type,
    });
  };

  const deleteFile = async (
    bucket: string,
    filePath: string
  ): Promise<void> => {
    if (!user) {
      throw new Error('로그인이 필요합니다.');
    }

    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('File deletion error:', error);
        
        // Sentry로 에러 리포팅
        handleSupabaseError(error, {
          context: 'fileDelete',
          bucket,
          filePath,
          userId: user.id,
        });
        
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  };

  const getSignedUrl = async (
    bucket: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        throw new Error(error.message);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Signed URL error:', error);
      throw error;
    }
  };

  return {
    uploadFile,
    uploadProfileImage,
    uploadProjectImage,
    uploadImage,
    deleteFile,
    getSignedUrl,
    uploading,
  };
};