import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/performance';
import 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyBS6oHXLZJJbCeVHTGoX15JhNI_tMuT7Hk',
  authDomain: 'efilc-239813.firebaseapp.com',
  databaseURL: 'https://efilc-239813.firebaseio.com',
  projectId: 'efilc-239813',
  storageBucket: 'efilc-239813.appspot.com',
  messagingSenderId: '189077601555',
  appId: '1:189077601555:web:318300dfc3a2d300',
  measurementId: 'G-YMDKBPFV5P',
};
firebase.initializeApp(firebaseConfig);

export const messaging = firebase.messaging();
messaging.usePublicVapidKey(
  'BMBWunap5uu6T3JMHFwjn-qJRmAC-tTw9_AwCQbUCCXJ69r9KkWxmJymYV2ytB3ySXupkuNN1wvkpXRtPgjpxBc'
);

export const analytics = firebase.analytics();
export const perf = firebase.performance();
