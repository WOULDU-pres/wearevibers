import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LoginForm {
  email: string;
  password: string;
  showPassword: boolean;
}

interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  agreeToTerms: boolean;
}

interface CommentForm {
  newComment: string;
}

export interface FormState {
  // 로그인 폼
  loginForm: LoginForm;
  
  // 회원가입 폼
  signupForm: SignupForm;
  
  // 댓글 폼
  commentForm: CommentForm;
  
  // Actions
  updateLoginForm: (updates: Partial<LoginForm>) => void;
  resetLoginForm: () => void;
  
  updateSignupForm: (updates: Partial<SignupForm>) => void;
  resetSignupForm: () => void;
  
  updateCommentForm: (updates: Partial<CommentForm>) => void;
  resetCommentForm: () => void;
  
  resetAllForms: () => void;
}

const initialLoginForm: LoginForm = {
  email: '',
  password: '',
  showPassword: false,
};

const initialSignupForm: SignupForm = {
  email: '',
  password: '',
  confirmPassword: '',
  username: '',
  fullName: '',
  showPassword: false,
  showConfirmPassword: false,
  agreeToTerms: false,
};

const initialCommentForm: CommentForm = {
  newComment: '',
};

export const useFormStore = create<FormState>()(
  devtools(
    (set, get) => ({
      loginForm: initialLoginForm,
      signupForm: initialSignupForm,
      commentForm: initialCommentForm,
      
      updateLoginForm: (updates: Partial<LoginForm>) =>
        set(
          (state) => ({
            loginForm: { ...state.loginForm, ...updates },
          }),
          false,
          'updateLoginForm'
        ),
      
      resetLoginForm: () =>
        set({ loginForm: initialLoginForm }, false, 'resetLoginForm'),
      
      updateSignupForm: (updates: Partial<SignupForm>) =>
        set(
          (state) => ({
            signupForm: { ...state.signupForm, ...updates },
          }),
          false,
          'updateSignupForm'
        ),
      
      resetSignupForm: () =>
        set({ signupForm: initialSignupForm }, false, 'resetSignupForm'),
      
      updateCommentForm: (updates: Partial<CommentForm>) =>
        set(
          (state) => ({
            commentForm: { ...state.commentForm, ...updates },
          }),
          false,
          'updateCommentForm'
        ),
      
      resetCommentForm: () =>
        set({ commentForm: initialCommentForm }, false, 'resetCommentForm'),
      
      resetAllForms: () =>
        set(
          {
            loginForm: initialLoginForm,
            signupForm: initialSignupForm,
            commentForm: initialCommentForm,
          },
          false,
          'resetAllForms'
        ),
    }),
    {
      name: 'form-store',
    }
  )
);