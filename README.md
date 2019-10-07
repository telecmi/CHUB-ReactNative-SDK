ContactHUB ReactNative SDK
===================


ContactHUB ! Enable App IVR in your APP using our ReactNative SDK, Were your custamer directly talk from your APP using internet, now your customer touch with your support,technical team from your mobile APP.




Documents
-------------

## **Install**


**npm**

    npm install chub-reactnative-sdk

**link dependencies**
```javascript
 react-native link react-native-webrtc
 react-native link react-native-incall-manager
```

## **Get Started**

**Import Chub SDK**  

```javascript
import chub from chub-reactnative-sdk;
```

## Method
**Register**

```javascript
chub.startCHUB(agentusername,agentpassword)
//For agent use your agent username and password
//For app IVR just use username: telecmi ,password: telecmi
```




## Calls
**Make Call**

```javascript
  chub.call('destination number');
```


**Accept Call**


```javascript
  chub.answer();
```


**Hangup/Reject call**
```javascript
  chub.hangup();
```
**Mute MIC**
```javascript
  chub.mute()
```
**unmute MIC(default)**
```javascript
  chub.unmute()
```
**Loudspeaker**
```javascript
  chub.speackerOn()
```
**Hearphone(default)**
```javascript
  chub.speakerOff()
```
**Send DTMF**

```javascript
  chub.dtmf('1');
```

**Logout**

```javascript
  chub.logout();
```
## CallBack
**Status**

Using this callback you can get all the event .
```javascript
  chub.onStatus=(data) => {
  //Data is JSON it contain event and status
  };
```

***Example***
```javascript
  chub.onStatus= (data) => {
  if(data.event=='register'&& data.status==true){
   //register successfully do your stuff here
     }
 };
```

## Events

**List of event and status**

| Event      | Status     | Description
| ------------- |:-------------:|:-------------:| 
| ws  | open | This event fired when websocket connection open |
| ws  | close | This event fired when websocket connection close |
| register | true | This event fired when you successfully register  |
| register | false | This event fired when your registration fails  |
| trying | true | This event fired when you make call  |
| ringing | true | This event fired when  you get **Incomming call** |
| media | true | This event fired when your destination ringing (**Early Media**)
| connected | true | This event fired when call successfully connected |
| answer | true | This event fired when call chage into  answer state|
| hangup | true | This event fired when call disconnected |

Android Setup
-------------

## Permissions

In android/app/src/main/AndroidManifest.xml add these permissions
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" />
<uses-feature android:name="android.hardware.camera.autofocus"/>

<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```
