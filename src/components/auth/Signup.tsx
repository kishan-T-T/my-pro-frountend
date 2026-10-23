import { useAuth } from 'auth/useAuth';

export const SignupButton = () => {
  const { loginWithRedirect } = useAuth();
  return (
    <button
      className="btn btn-primary btn-block"
      onClick={() =>
        loginWithRedirect({
          screen_hint: "signup",
        })
      }
    >
      Sign Up
    </button>
  );
};
