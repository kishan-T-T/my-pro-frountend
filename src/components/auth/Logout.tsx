import { useAuth } from 'auth/useAuth';

export const LogoutButton = () => {
  const { logout } = useAuth();
  return (
    <button
      className="text-white bg-red-500 hover:bg-red-400 shadow-sm px-5 py-2 text-medium rounded-md transition-all"
      onClick={() =>
        logout({
          returnTo: window.location.origin,
        })
      }
    >
      Log Out
    </button>
  );
};
