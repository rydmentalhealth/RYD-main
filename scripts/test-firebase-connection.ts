// scripts/test-firebase-connection.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaFRSfeZGvQFaaE8KzhPFsvag2hkIO6Ck",
  authDomain: "rydadmin-hub.firebaseapp.com",
  projectId: "rydadmin-hub",
  storageBucket: "rydadmin-hub.firebasestorage.app",
  messagingSenderId: "20289389765",
  appId: "1:20289389765:web:89e94da7bf396fc946dcac",
  measurementId: "G-B69WZL3B7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  try {
    // Test writing to Firestore
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, {
      message: 'Firebase connection test',
      timestamp: new Date(),
    });
    
    console.log('✅ Successfully wrote to Firestore');
    console.log('Document ID:', testDoc.id);
    
    // Test reading from Firestore
    const snapshot = await getDocs(testCollection);
    console.log('✅ Successfully read from Firestore');
    console.log('Document count:', snapshot.size);
    
    // Clean up test document
    await deleteDoc(doc(db, 'test', testDoc.id));
    console.log('✅ Successfully deleted test document');
    
    console.log('🎉 Firebase connection test passed!');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}

// Run test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFirebaseConnection().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testFirebaseConnection };