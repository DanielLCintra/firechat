<script>
	import Initialize from './Initialize.vue'
	import ConversationContainer from './ConversationContainer.vue'
	import { mapState, mapActions } from 'vuex'
	import lf from 'localforage'

	export default {
		name: 'app',
		data () {
			return {
				roomId: ''
			}
		},
		components: {
	    	Initialize,
	    	ConversationContainer
	  	},	
	  	computed: {
			...mapState({
		      conversations: state => state.conversations.all,
		      convoIds: state => state.conversations.allIds
		    })
	  	},
	  	methods:{
	  		get () {
		        this.$store.dispatch('users/get')
		        this.$store.dispatch('conversations/get')
		    },
		    createRoom () {
		    	this.$store.dispatch('conversations/createRoom')
		    	this.get()
		    }
	  	},
	  	mounted () {
	  		lf.setItem('rooms', [])
	  		this.get()
	  	}
	}
</script>

<template>
  <div>
  	<input type="button" value="Create Room" @click="createRoom()"/>
  	<input type="text" placeholder="Room id" v-model="roomId"/>
  	<input type="button" value="Enter Room" @click="enterRoom()"/>
   	<ConversationContainer 
      v-for="id in convoIds"
      :conversation="conversations[id]"
      :id="id"
      :key="id"
    />
  </div>  
</template>

<style>
</style>