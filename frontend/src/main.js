import Vue from 'vue';
import axios from 'axios';
import VueClipboard from 'vue-clipboard2'

Vue.use(VueClipboard)

var axios_cfg = function(url, data='', type='form') {
  if (data == '') {
    return {
      method: 'get',
      url: url
    };
  } else if (type == 'form') {
    return {
      method: 'post',
      url: url,
      data: data,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };
  } else if (type == 'file') {
    return {
      method: 'post',
      url: url,
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' }
    };
  }
};

new Vue({
  el: '#app',
  data: {
    u: {
      ctxTop: '0',
      ctxLeft: '0',
      ctxVisible: false,
      ctxMenuItems: { 'u-revoke': 'Revoke', 'u-unrevoke': 'Unrevoke', 'u-show-config': 'Show config'},
      columns: [],
      data: {},
      name: '',
      newUserName: '',
      modalNewUserVisible: false,
      modalShowConfigVisible: false,
      openvpnConfig: ''
    }
  },
  watch: {
    u: function () {
      this.u.columns = Object.keys(this.u.data[0]) //.reverse()
    }
  },
  mounted: function () {
    this.u_get_data()
  },
  created() {
    var _this = this
    this.$root.$on('u-revoke', function (msg) {
      axios.request(axios_cfg('api/v1/user/revoke?user=' + _this.u.name))
      .then(function(response) {
        console.log(response.data);
        _this.u_get_data();
      });
    })
    this.$root.$on('u-unrevoke', function () {
      axios.request(axios_cfg('api/v1/user/unrevoke?user=' + _this.u.name))
      .then(function(response) {
        console.log(response.data);
        _this.u_get_data();
      });
    })
    this.$root.$on('u-show-config', function () {
      this.u.modalShowConfigVisible = true;
      axios.request(axios_cfg('api/v1/user/showcfg?user=' + _this.u.name))
      .then(function(response) {
        _this.u.openvpnConfig = response.data;
      });
    })
  },
  computed: {
    uCtxStyle: function () {
      return {
        'top': this.u.ctxTop + 'px',
        'left': this.u.ctxLeft + 'px'
      }
    }
  },
  methods: {
    copyTextArea: function (e) {
      e.clipboardData.setData("text/plain", this.u.openvpnConfig);
    },
    u_ctx_click: function (e) {
      this.$root.$emit(e.target.dataset.name)
      this.u_ctx_hide()
    },
    u_ctx_hide: function () {
      this.u.ctxVisible = false
    },
    u_ctx_show: function (e) {
      this.u.name = e.target.parentElement.dataset.name
      this.u.ctxTop = e.pageY
      this.u.ctxLeft = e.pageX
      this.u.ctxVisible = true
    },
    u_get_data: function() {
      var _this = this;
      axios.request(axios_cfg('api/v1/users/list'))
      .then(function(response) {
        _this.u.data = response.data
      });
    },
    create_user: function() {
      var _this = this;
      axios.request(axios_cfg('api/v1/user/create?user=' + this.u.newUserName))
      .then(function(response) {
        console.log(response.data);
        _this.u_get_data();
        _this.u.newUserName = '';
      });
    }
  }
})
