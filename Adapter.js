'use strict';

// Expose the Adapter function/object.
module.exports = Adapter;


// Dependencies

var WebRTC = require('react-native-webrtc'),
	debug = require('debug')('rtcninja:Adapter'),
	debugerror = require('debug')('rtcninja:ERROR:Adapter'),
	// Internal vars
	getUserMedia = WebRTC.getUserMedia,
	mediaDevices = null,
	RTCPeerConnection = WebRTC.RTCPeerConnection,
	RTCSessionDescription = WebRTC.RTCSessionDescription,
	RTCIceCandidate = WebRTC.RTCIceCandidate,
	MediaStreamTrack = WebRTC.MediaStreamTrack,
	getMediaDevices = null,
	attachMediaStream = null,
	canRenegotiate = false,
	oldSpecRTCOfferOptions = false,
	browserVersion =  0,
	hasWebRTC = true,
	// Dirty trick to get this library working in a Node-webkit env with browserified libs
	virtGlobal = global.window || global,
	// Don't fail in Node
	virtNavigator = virtGlobal.navigator || {};

debugerror.log = console.warn.bind(console);


// Constructor.

function Adapter(options) {

	console.log(WebRTC)

		hasWebRTC = true;
		getUserMedia = WebRTC.getUserMedia;
		mediaDevices = virtNavigator.mediaDevices;
		RTCPeerConnection = WebRTC.RTCPeerConnection;
		RTCSessionDescription = WebRTC.RTCSessionDescription;
		RTCIceCandidate = WebRTC.RTCIceCandidate;
		MediaStreamTrack = WebRTC.MediaStreamTrack;
		if (MediaStreamTrack && MediaStreamTrack.getSources) {
			getMediaDevices = MediaStreamTrack.getSources.bind(MediaStreamTrack);
		} else if (virtNavigator.getMediaDevices) {
			getMediaDevices = virtNavigator.getMediaDevices.bind(virtNavigator);
		}
		attachMediaStream = virtGlobal.attachMediaStream || function (element, stream) {
			element.src = URL.createObjectURL(stream);
			return element;
		};
		canRenegotiate = true;
		oldSpecRTCOfferOptions = false;



	function throwNonSupported(item) {
		return function () {
			throw new Error('rtcninja: WebRTC not supported, missing ' + item +
			' [browser: react-native 0.40]');
		};
	}


	// Public API.

	// Expose a WebRTC checker.
	Adapter.hasWebRTC = function () {
console.log(hasWebRTC)
		return hasWebRTC;
	};
console.log(getUserMedia)
	// Expose getUserMedia.
	if (getUserMedia) {
		Adapter.getUserMedia = function (constraints, successCallback, errorCallback) {
			debug('getUserMedia() | constraints: %o', constraints);

			try {
				getUserMedia(constraints,
					function (stream) {
						debug('getUserMedia() | success');
						if (successCallback) {
							successCallback(stream);
						}
					},
					function (error) {
						debug('getUserMedia() | error:', error);
						if (errorCallback) {
							errorCallback(error);
						}
					}
				);
			}
			catch (error) {
				debugerror('getUserMedia() | error:', error);
				if (errorCallback) {
					errorCallback(error);
				}
			}
		};
	} else {
		console.log(constraints)
		Adapter.getUserMedia = function (constraints, successCallback, errorCallback) {
			debugerror('getUserMedia() | WebRTC not supported');
			if (errorCallback) {
				errorCallback(new Error('rtcninja: WebRTC not supported, missing ' +
				'getUserMedia [browser: react-native 0.40]'));
			} else {
				throwNonSupported('getUserMedia');
			}
		};
	}

	// Expose mediaDevices.
	Adapter.mediaDevices = mediaDevices;

	// Expose RTCPeerConnection.
	Adapter.RTCPeerConnection = RTCPeerConnection || throwNonSupported('RTCPeerConnection');

	// Expose RTCSessionDescription.
	Adapter.RTCSessionDescription = RTCSessionDescription || throwNonSupported('RTCSessionDescription');

	// Expose RTCIceCandidate.
	Adapter.RTCIceCandidate = RTCIceCandidate || throwNonSupported('RTCIceCandidate');

	// Expose MediaStreamTrack.
	Adapter.MediaStreamTrack = MediaStreamTrack || throwNonSupported('MediaStreamTrack');

	// Expose getMediaDevices.
	Adapter.getMediaDevices = getMediaDevices;

	// Expose MediaStreamTrack.
	Adapter.attachMediaStream = attachMediaStream || throwNonSupported('attachMediaStream');

	// Expose canRenegotiate attribute.
	Adapter.canRenegotiate = canRenegotiate;

	// Expose closeMediaStream.
	Adapter.closeMediaStream = function (stream) {
		if (!stream) {
			return;
		}

		// Latest spec states that MediaStream has no stop() method and instead must
		// call stop() on every MediaStreamTrack.
		try {
			debug('closeMediaStream() | calling stop() on all the MediaStreamTrack');

			var tracks, i, len;

			if (stream.getTracks) {
				tracks = stream.getTracks();
				for (i = 0, len = tracks.length; i < len; i += 1) {
					tracks[i].stop();
				}
			} else {
				tracks = stream.getAudioTracks();
				for (i = 0, len = tracks.length; i < len; i += 1) {
					tracks[i].stop();
				}
				tracks = stream.getVideoTracks();
				for (i = 0, len = tracks.length; i < len; i += 1) {
					tracks[i].stop();
				}
			}
		} catch (error) {
			// Deprecated by the spec, but still in use.
			// NOTE: In Temasys IE plugin stream.stop is a callable 'object'.
			if (typeof stream.stop === 'function' || typeof stream.stop === 'object') {
				debug('closeMediaStream() | calling stop() on the MediaStream');

				stream.stop();
			}
		}
	};

	// Expose fixPeerConnectionConfig.
	Adapter.fixPeerConnectionConfig = function (pcConfig) {
		var i, len, iceServer, hasUrls, hasUrl;

		if (!Array.isArray(pcConfig.iceServers)) {
			pcConfig.iceServers = [];
		}

		for (i = 0, len = pcConfig.iceServers.length; i < len; i += 1) {
			iceServer = pcConfig.iceServers[i];
			hasUrls = iceServer.hasOwnProperty('urls');
			hasUrl = iceServer.hasOwnProperty('url');

			if (typeof iceServer === 'object') {
				// Has .urls but not .url, so add .url with a single string value.
				if (hasUrls && !hasUrl) {
					iceServer.url = (Array.isArray(iceServer.urls) ? iceServer.urls[0] : iceServer.urls);
				// Has .url but not .urls, so add .urls with same value.
				} else if (!hasUrls && hasUrl) {
					iceServer.urls = (Array.isArray(iceServer.url) ? iceServer.url.slice() : iceServer.url);
				}

				// Ensure .url is a single string.
				if (hasUrl && Array.isArray(iceServer.url)) {
					iceServer.url = iceServer.url[0];
				}
			}
		}
	};

	// Expose fixRTCOfferOptions.
	Adapter.fixRTCOfferOptions = function (options) {
		options = options || {};

		// New spec.
		if (!oldSpecRTCOfferOptions) {
			if (options.mandatory && options.mandatory.hasOwnProperty('OfferToReceiveAudio')) {
				options.offerToReceiveAudio = options.mandatory.OfferToReceiveAudio ? 1 : 0;
			}
			if (options.mandatory && options.mandatory.hasOwnProperty('OfferToReceiveVideo')) {
				options.offerToReceiveVideo = options.mandatory.OfferToReceiveVideo ? 1 : 0;
			}
			delete options.mandatory;
		// Old spec.
		} else {
			if (options.hasOwnProperty('offerToReceiveAudio')) {
				options.mandatory = options.mandatory || {};
				options.mandatory.OfferToReceiveAudio = options.offerToReceiveAudio ? true : false;
			}
			if (options.hasOwnProperty('offerToReceiveVideo')) {
				options.mandatory = options.mandatory || {};
				options.mandatory.OfferToReceiveVideo = options.offerToReceiveVideo ? true : false;
			}
		}
	};

	return Adapter;
}
