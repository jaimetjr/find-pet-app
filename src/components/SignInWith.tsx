import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import appleButton from '../assets/apple.png';
import googleButton from '../assets/google.png';
import facebookButton from '../assets/facebook.png';
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
        const { createdSessionId, setActive, authSessionResult } =
          await startSSOFlow({
            strategy,
            redirectUrl: AuthSession.makeRedirectUri(),
          });

        if (createdSessionId) {
          console.log('createdSessionId', authSessionResult);
          setActive!({ session: createdSessionId });
        } else {
          // If there is no `createdSessionId`,
          // there are missing requirements, such as MFA
          // Use the `signIn` or `signUp` returned from `startSSOFlow`
          // to handle next steps
        }
      } catch (err) {
        console.error(JSON.stringify(err, null, 2));
      }
    }, []);
  
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