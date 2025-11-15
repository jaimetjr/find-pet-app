import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import appleButton from '../assets/LogoNovoApple.png';
import googleButton from '../assets/LogoNovoGoogle.png';
import facebookButton from '../assets/LogoNovoFace.png';
import { useEffect, useCallback } from 'react';
import { useSSO } from '@clerk/clerk-expo';
import { Pressable, Image } from 'react-native';

export const useWarmUpBrowser = () => {
    useEffect(() => {
      // Preloads the browser for Android devices to reduce authentication load time
      // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
      void WebBrowser.warmUpAsync();
      return () => {
        // Cleanup: closes browser when component unmounts
        void WebBrowser.coolDownAsync();
      };
    }, []);
  };
  
  // Handle any pending authentication sessions
  WebBrowser.maybeCompleteAuthSession();
  
  type SignInWithProps = {
    strategy: 'oauth_google' | 'oauth_apple' | 'oauth_facebook';
  };

  const strategyIcons = {
    oauth_google: googleButton,
    oauth_apple: appleButton,
    oauth_facebook: facebookButton,
  };

  export default function SignInWith({ strategy }: SignInWithProps) {
    useWarmUpBrowser();

    const { startSSOFlow } = useSSO();
  
    const onPress = useCallback(async () => {
      try {
        console.log('Starting SSO flow for strategy:', strategy);
        const { createdSessionId, setActive, authSessionResult, signIn, signUp } =
          await startSSOFlow({
            strategy,
            redirectUrl: AuthSession.makeRedirectUri({native: 'findpetapp://oauth-callback'}),
          });
          console.log('SSO flow result:', { strategy, createdSessionId, hasSignIn: !!signIn, hasSignUp: !!signUp });
          
          if (createdSessionId) {
            console.log('Session created, setting active');
            setActive!({ session: createdSessionId });
          } else {
            console.log("signIn full object:", JSON.stringify(signIn, null, 2));
            console.log("authSessionResult", JSON.stringify(authSessionResult, null, 2));
          }

      } catch (err) {
        console.error('SSO flow error for strategy:', strategy, err);
        // Check if error is due to user cancellation
        const errorString = err ? JSON.stringify(err) : '';
        if (errorString.includes('cancelled') || errorString.includes('cancel') || errorString === '{}') {
          console.log('OAuth flow cancelled by user');
          return; // Don't show error for cancellation
        }
        console.error(JSON.stringify(err, null, 2));
      }
    }, [strategy]);
  
    return (
      <Pressable onPress={onPress}>
        <Image
          source={strategyIcons[strategy]}
          style={{ width: 62, height: 62 }}
          resizeMode='contain'
        />
      </Pressable>
    );
  }