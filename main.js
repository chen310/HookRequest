const ENABLE_LOCAL_VIP = true;
const ENABLE_LOCAL_SVIP = true;
const VIP_LEVEL = 5;

window.hookRequestAfter = function (path, response) {
    // console.log("path", path);
    // console.log("response", response);

    if (response.code != 200) {
        return;
    }
    if (path.includes("/batch")) {
        if ('/api/music-vip-membership/client/vip/info' in response) {
            return unblockLocalVIP(response);
        }
    }
	else if (path.includes("/vipauth/app/auth/query")) {
		return unblockLyricsEffects(response);
	}
};

const unblockLocalVIP = (obj) => {
	console.log('unblockLocalVIP() has been triggered.');
    let info = obj['/api/music-vip-membership/client/vip/info'];
    if (info && ENABLE_LOCAL_VIP) {
        const defaultPackage = {
            iconUrl: null,
            dynamicIconUrl: null,
            isSign: false,
            isSignIap: false,
            isSignDeduct: false,
            isSignIapDeduct: false,
        };
        const nVipLevel = VIP_LEVEL;

        const expireTime = info.data.now + 31622400000;
        info.data.redVipLevel = 7;
        info.data.redVipAnnualCount = 1;

        info.data.musicPackage = {
            ...defaultPackage,
            ...info.data.musicPackage,
            vipCode: 230,
            vipLevel: nVipLevel,
            expireTime,
        };

        info.data.associator = {
            ...defaultPackage,
            ...info.data.associator,
            vipCode: 100,
            vipLevel: nVipLevel,
            expireTime,
        };

        if (ENABLE_LOCAL_SVIP){
            info.data.redplus = {
                ...defaultPackage,
                ...info.data.redplus,
                vipCode: 300,
                vipLevel: nVipLevel,
                expireTime,
            };

            info.data.albumVip = {
                ...defaultPackage,
                ...info.data.albumVip,
                vipCode: 400,
                vipLevel: 0,
                expireTime,
            };
        }
        
    }
    obj['/api/music-vip-membership/client/vip/info'] = info;
};

const unblockLyricsEffects = (obj) => {
	console.log('unblockLyricsEffects() has been triggered.');
	const { data, code } = obj;
	if (code === 200 && Array.isArray(data)) {
		data.forEach((item) => {
			if ('canUse' in item) item.canUse = true;
			if ('canNotUseReasonCode' in item) item.canNotUseReasonCode = 200;
		});
	}
};
