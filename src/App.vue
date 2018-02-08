<script>
	import Initialize from './Initialize.vue'
	import ConversationContainer from './ConversationContainer.vue'
	import { mapState, mapActions } from 'vuex'
	import lf from 'localforage'

	export default {
		name: 'app',
		data () {
			return {
				userId: '',
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
		    }),
		    ...mapState('conversations', ['currentRoom'])
	  	},
	  	watch:{
	  		currentRoom(value){
	  			this.roomId = value
	  		}
	  	},
	  	methods:{
	  		get () {
		        this.$store.dispatch('users/get')
		        this.$store.dispatch('conversations/get')
		    },
		    createRoom () {
		    	this.$store.dispatch('conversations/createRoom')
		    },
		   	login (){
		    	this.$store.dispatch('conversations/enterRoom', {roomId: this.roomId, userId: this.userId})
		    }
	  	},
	  	mounted () {
	  		lf.getItem('rooms').then(value => {
        
	        	if(value === null){
	          		lf.setItem('rooms', [])
	        	}else{
	        		this.$store.dispatch('conversations/get')
	        	}
	  		})
	  	}
	}
</script>

<template>
  <div>
  	<input type="button" value="Create Room" @click="createRoom()"/><br/><br/>
  	<input type="text" placeholder="Room id" v-model="roomId"/>
  	<input type="text" placeholder="User Id" v-model="userId"/><br/><br/>
  	<input type="button" value="Login" @click="login()"/>
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