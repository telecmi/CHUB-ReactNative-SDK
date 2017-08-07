
import jssip from './JsSIP';
import incall from 'react-native-incall-manager';

export default class chub{

constructor()
{
  var self=this;
     this.startCHUB = (agentid,password) =>
        {
                let agent = agentid || 1;
                let pwd = password || 1;
                this.verto = new jssip.UA({
                     uri: 'sip:'+agent+'@chubws.telecmi.com',
                     ws_servers: 'wss://chubws.telecmi.com',
                     password: pwd.toString(),
                      stun_servers: ["stun:stun.l.google.com:19302"]
                     });

                      //Websocket connection opened
                      this.verto.on('connected', () => {
                          self.onStatus({
                              event: 'ws',
                              status: 'open'
                          })
                      });
                      //Websocket connection closed
                      this.verto.on('disconnected', (e) =>  {
                          self.onStatus({
                              event: 'ws',
                              status: 'closed'
                          })
                      });
                      //Registered successfully
                      this.verto.on('registered', () => {
                          self.onStatus({
                              event: 'register',
                              status: true
                          })
                      });

                      //Register failed
                      this.verto.on('registrationFailed', (e) => {
                          self.onStatus({
                              event: 'register',
                              status: false
                          })
                      });

                      //Unregister  successfully
                      this.verto.on('unregistered', () => {
                          self.onStatus({
                              event: 'register',
                              status: false
                          })
                      });

                    this.verto.start();
        }



        var eventHandlers = {
        'progress': function (e) {
            self.onStatus({
                event: 'trying',
                status: true
            })
        },
        'failed': function (e) {
          incall.stop()
            self.onStatus({
                event: 'hangup',
                status: true
            })
            if (self.telecmi_call) {

                self.telecmi_call = null
            }
        },
        'confirmed': function (e) {
          incall.start({media: 'audio'});
            self.onStatus({
                event: 'connected',
                status: true
            })


        },
        'addstream': function (e) {

        },
        'ended': function (e) {
          incall.stop()
            self.onStatus({
                event: 'hangup',
                status: true
            })
            if (self.telecmi_call) {

                self.telecmi_call = null
            }
        }
    };


    this.call=function(number)
    {
      if (this.telecmi_call) {
           return;
       }
       if (number) {
           if (this.verto) {
               var options = {
                   'eventHandlers': eventHandlers,
                   mediaConstraints: {
                       audio: true,
                       video: false
                   },
                   pcConfig: {
                       "iceServers": [{
                           "urls": ["stun:stun.l.google.com:19302"]
                       }]
                   },
                   mediaConstraints: {
                       audio: true,
                       video: false
                   },
                   rtcOfferConstraints: {
                       offerToReceiveAudio: 1,
                       offerToReceiveVideo: 0
                   }
               };
               self.telecmi_call = this.verto.call('sip:'+number, options)


           }
           return;
       }
       return
    }

    this.onStatus=function(data){}

    this.dtmf=function(dtmf)
    {
      var key = key | 'A'
        if (self.telecmi_call) {
            self.telecmi_call.sendDTMF(dtmf.toString())
        }

        return;
    }


    this.hangup=function(){
      if (self.telecmi_call) {

            self.telecmi_call.terminate()
        }
    }

    this.speackerOn=function()
    {
      incall.setSpeakerphoneOn(true)
    }

    this.speackerOff=function()
    {
      incall.setSpeakerphoneOn(false)
    }

    this.mute=function()
    {
incall.setMicrophoneMute(true)
    }

    this.unmute=function()
    {
incall.setMicrophoneMute(false)
    }


    this.logout=function(){
      if (self.verto) {
            self.verto.unregister();
        }
        return;
    }

}
}
