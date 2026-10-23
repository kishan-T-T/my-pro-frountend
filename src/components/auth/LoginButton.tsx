import { useAuth } from 'auth/useAuth';

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth();
  return (
    <button
      className="btn btn-primary btn-block"
      onClick={() => loginWithRedirect()}
    >
      Log In
    </button>
  );
};
