// useValidation.tsx - 폼 유효성 검사 훅
// EPIC-04: 보안 및 안정성 - STORY-016

import { useState, useCallback } from 'react';
import { z } from 'zod';
import { sanitizeObject, contentSanitizers } from '@/lib/sanitization';

// 유효성 검사 결과 타입
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
  fieldErrors?: Record<keyof T, string>;
}

// 유효성 검사 옵션
export interface ValidationOptions {
  sanitize?: boolean;
  sanitizer?: (input: string) => string;
  abortEarly?: boolean;
}

/**
 * 폼 유효성 검사 훅
 * @param schema Zod 스키마
 * @param options 유효성 검사 옵션
 */
export function useValidation<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>,
  options: ValidationOptions = {}
) {
  const [errors, setErrors] = useState<Record<keyof T, string>>({});
  const [isValidating, setIsValidating] = useState(false);

  const {
    sanitize = true,
    sanitizer = contentSanitizers.title,
  } = options;

  /**
   * 데이터 유효성 검사
   */
  const validate = useCallback(
    async (data: unknown): Promise<ValidationResult<T>> => {
      setIsValidating(true);
      setErrors({});

      try {
        // 데이터 새니타이제이션
        let processedData = data;
        if (sanitize && data && typeof data === 'object') {
          processedData = sanitizeObject(data as Record<string, unknown>, sanitizer);
        }

        // Zod 스키마 검증
        const result = await schema.safeParseAsync(processedData);

        if (result.success) {
          setIsValidating(false);
          return {
            success: true,
            data: result.data,
          };
        } else {
          // 에러 처리
          const fieldErrors: Record<keyof T, string> = {};
          const zodErrors: Record<string, string[]> = {};

          result.error.issues.forEach((issue) => {
            const path = issue.path.join('.');
            const field = issue.path[0] as keyof T;

            if (!zodErrors[path]) {
              zodErrors[path] = [];
            }
            zodErrors[path].push(issue.message);

            // 첫 번째 에러만 필드 에러로 설정
            if (!fieldErrors[field]) {
              fieldErrors[field] = issue.message;
            }
          });

          setErrors(fieldErrors);
          setIsValidating(false);

          return {
            success: false,
            errors: zodErrors,
            fieldErrors,
          };
        }
      } catch {
        setIsValidating(false);
        return {
          success: false,
          errors: {
            root: ['유효성 검사 중 오류가 발생했습니다.'],
          },
          fieldErrors: {} as Record<keyof T, string>,
        };
      }
    },
    [schema, sanitize, sanitizer]
  );

  /**
   * 단일 필드 유효성 검사
   */
  const validateField = useCallback(
    async (fieldName: keyof T, value: unknown): Promise<boolean> => {
      try {
        // 필드만 검증하기 위해 pick 사용
        const fieldSchema = schema.pick({ [fieldName]: true } as Record<keyof T, true>);
        const fieldData = { [fieldName]: value } as Partial<T>;

        let processedData = fieldData;
        if (sanitize) {
          processedData = sanitizeObject(
            fieldData as Record<string, unknown>,
            sanitizer,
          ) as Partial<T>;
        }

        const result = await fieldSchema.safeParseAsync(processedData);

        if (result.success) {
          // 해당 필드의 에러 제거
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
          return true;
        } else {
          // 해당 필드의 에러 설정
          const fieldError = result.error.issues[0]?.message || '유효하지 않은 값입니다.';
          setErrors((prev) => ({
            ...prev,
            [fieldName]: fieldError,
          }));
          return false;
        }
      } catch {
        setErrors((prev) => ({
          ...prev,
          [fieldName]: '유효성 검사 중 오류가 발생했습니다.',
        }));
        return false;
      }
    },
    [schema, sanitize, sanitizer]
  );

  /**
   * 에러 초기화
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * 특정 필드 에러 초기화
   */
  const clearFieldError = useCallback((fieldName: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * 에러 설정
   */
  const setFieldError = useCallback((fieldName: keyof T, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }));
  }, []);

  /**
   * 모든 필드가 유효한지 확인
   */
  const isValid = Object.keys(errors).length === 0;

  /**
   * 특정 필드에 에러가 있는지 확인
   */
  const hasFieldError = useCallback(
    (fieldName: keyof T): boolean => {
      return fieldName in errors;
    },
    [errors]
  );

  /**
   * 특정 필드의 에러 메시지 가져오기
   */
  const getFieldError = useCallback(
    (fieldName: keyof T): string | undefined => {
      return errors[fieldName];
    },
    [errors]
  );

  return {
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldError,
    errors,
    isValidating,
    isValid,
    hasFieldError,
    getFieldError,
  };
}

/**
 * 실시간 폼 유효성 검사 훅
 * @param schema Zod 스키마
 * @param initialData 초기 데이터
 * @param options 유효성 검사 옵션
 */
export function useFormValidation<T extends Record<string, unknown>>(
  schema: z.ZodSchema<T>,
  initialData: Partial<T> = {},
  options: ValidationOptions = {}
) {
  const [data, setData] = useState<Partial<T>>(initialData);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  const validation = useValidation(schema, options);

  /**
   * 필드 값 업데이트
   */
  const updateField = useCallback(
    async (fieldName: keyof T, value: unknown) => {
      const newData = { ...data, [fieldName]: value };
      setData(newData);

      // 터치된 필드로 표시
      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      // 실시간 유효성 검사
      if (touched[fieldName]) {
        await validation.validateField(fieldName, value);
      }
    },
    [data, touched, validation]
  );

  /**
   * 필드 포커스 해제 시 처리
   */
  const handleBlur = useCallback(
    async (fieldName: keyof T) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      
      if (data[fieldName] !== undefined) {
        await validation.validateField(fieldName, data[fieldName]);
      }
    },
    [data, validation]
  );

  /**
   * 전체 폼 유효성 검사
   */
  const validateForm = useCallback(async (): Promise<ValidationResult<T>> => {
    // 모든 필드를 터치된 것으로 표시
    const allTouched = Object.keys(data).reduce(
      (acc, key) => ({ ...acc, [key]: true }),
      {} as Record<keyof T, boolean>
    );
    setTouched(allTouched);

    return await validation.validate(data);
  }, [data, validation]);

  /**
   * 폼 초기화
   */
  const resetForm = useCallback((newData: Partial<T> = {}) => {
    setData(newData);
    setTouched({} as Record<keyof T, boolean>);
    validation.clearErrors();
  }, [validation]);

  /**
   * 특정 필드가 터치되었는지 확인
   */
  const isFieldTouched = useCallback(
    (fieldName: keyof T): boolean => {
      return touched[fieldName] || false;
    },
    [touched]
  );

  /**
   * 필드에 에러가 있고 터치되었는지 확인
   */
  const shouldShowFieldError = useCallback(
    (fieldName: keyof T): boolean => {
      return validation.hasFieldError(fieldName) && isFieldTouched(fieldName);
    },
    [validation, isFieldTouched]
  );

  return {
    data,
    touched,
    updateField,
    handleBlur,
    validateForm,
    resetForm,
    isFieldTouched,
    shouldShowFieldError,
    ...validation,
  };
}

/**
 * 비동기 유효성 검사 훅 (예: 중복 확인)
 */
export function useAsyncValidation<T>(
  validator: (value: T) => Promise<boolean>,
  errorMessage = '유효하지 않은 값입니다.',
  debounceMs = 500
) {
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validate = useCallback(
    async (value: T) => {
      setIsValidating(true);
      setError(null);
      setIsValid(null);

      try {
        // 디바운싱을 위한 지연
        await new Promise((resolve) => setTimeout(resolve, debounceMs));

        const result = await validator(value);
        
        if (result) {
          setIsValid(true);
          setError(null);
        } else {
          setIsValid(false);
          setError(errorMessage);
        }
      } catch {
        setIsValid(false);
        setError('검증 중 오류가 발생했습니다.');
      } finally {
        setIsValidating(false);
      }

      return isValid;
    },
    [validator, debounceMs, isValid, errorMessage]
  );

  const reset = useCallback(() => {
    setIsValidating(false);
    setError(null);
    setIsValid(null);
  }, []);

  return {
    validate,
    reset,
    isValidating,
    error,
    isValid,
  };
}