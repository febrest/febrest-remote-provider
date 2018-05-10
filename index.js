'use strict'
import { Provider } from 'febrest';
function toObject(s) {
    try {
        return JSON.parse(s)
    } catch (e) {
        return s;
    }
}

function getBody(params) {
    if (!params) {
        return null;
    }
    let body = [];
    for (let o in params) {
        body.push(o + '=' + params[o]);
    }
    return body.join('&');
}
function isFormData(data) {
    typeof FormData === 'undefined' ? false : data instanceof FormData;
}

const CONTENT_TYPE = {
    URL: 'application/x-www-form-urlencoded; charset=UTF-8',
    FORMDATA: 'multipart/form-data; charset=UTF-8'
}
class RemoteProvider extends Provider {
    remote: string;
    params: any;
    method: string;
    headers: Headers;
    constructor(config) {
        super(config);
        this.remote = config.remote;
        this.method = config.method || 'get';
        this.headers = config.headers;
    }
    getState($payload) {
        let headers = new Headers();
        let payload = $payload() || {};
        let { method, remote } = this;
        let requestBody = payload.requestBody;
        let body;

        if (this.headers) {
            headers = new Headers(this.headers);
        }
        if (isFormData(requestBody)) {
            body = requestBody;
            method = 'post';
            headers.append('Content-Type', CONTENT_TYPE.FORMDATA);
        } else {
            body = getBody(requestBody);
            headers.append('Content-Type', CONTENT_TYPE.URL);
        }
        if (method == 'get' && body) {
            remote += '?' + body;
            body = null;
        }

        return fetch(remote, {
            method,
            headers,
            body,
            credentials: 'include'
        }).then(function (response) {
            return response.text().then(function (text) {
                return toObject(text);
            })
        }, function () {
            return Promise.resolve(null);
        })
    }
    setState() {
        return;
    }
}

export default RemoteProvider;