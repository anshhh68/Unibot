// Type shim for Google Identity Services (GSI) global
// Loaded via <script src="https://accounts.google.com/gsi/client">

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback: (response: { credential: string }) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: {
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            width?: number;
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            logo_alignment?: 'left' | 'center';
          }
        ) => void;
        prompt: () => void;
        disableAutoSelect: () => void;
        revoke: (hint: string, done: () => void) => void;
      };
    };
  };
}
