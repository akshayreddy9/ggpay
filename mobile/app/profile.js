import { Redirect } from 'expo-router';

// The profile now lives in the "You" tab on the home screen.
export default function Profile() {
  return <Redirect href={{ pathname: '/home', params: { tab: 'you' } }} />;
}
