<template>
<div>
  Hello {{message}}
  <router-view></router-view>
  <div>
    <button ><router-link to="/">Change Comp 1</router-link></button>
    <button ><router-link to="/comp2">Change Comp 2</router-link></button>
    <button @click="trackView()">Track View</button>
    <button @click="trackEvent()">Track Event</button>
    <button @click="trackException()">Track Exception</button>
    <button @click="testMixin()">Test Mixin</button>
    <button @click="identify()">Identify</button>
    <button @click="setUserProperties()">User properties</button>
    <button @click="setSuperProperties()">Super properties</button>
  </div>
</div>
</template>

<script>
export default {
  name: 'App',
  data () {
    return {
      message: 'MultiAnalytics'
    }
  },
  mounted () {
    console.log(this.$ma)
  },
  methods: {
    trackEvent () {
      this.$ma.trackEvent({action: 'test category', category: 'clicks', properties: {interesting: true}})
    },
    trackView () {
      this.$ma.trackView({viewName: 'test view'})
    },
    trackException () {
      this.$ma.trackException({description: 'test exception', isFatal: true})
    },
    testMixin () {
      this.$mam.test()
    },
    identify () {
      this.$ma.identify({userId: 12345})
    },
    setUserProperties () {
      this.$ma.setUserProperties({userId: 'userTest', options: {platform: 'web'}})
    },
    setSuperProperties () {
      this.$ma.setSuperProperties({platform: 'web'})
    }
  }
}
</script>
<stlye></stlye>
