import Vue from 'vue'
import uuidv4 from 'uuid/v4'
import lf from 'localforage'
import _ from 'lodash'

const state = {
  all: {},
  allIds: [],
  allMsgIds: [],
  currentRoom: ''
}

const mutations = {
  SET_CONVERSATION (state, { conversation }) {
    const data = conversation.data()
    state.all = {
      ...state.all, 
      [conversation.id]: { users: data.users, created: data.created, messages: [] }
    } 
    state.allIds.push(conversation.id)
  },
  ADD_MESSAGE (state, { conversationId, message }) {
    if (!state.allMsgIds.includes(message.id)) {
      state.all[conversationId].messages.push(message)
      state.allMsgIds.push(message.id)
    }
  },
  CLEAR_DATA (state){
    state.all = {},
    state.allIds = [],
    state.allMsgIds = []
  },
  SET_CURRENT_ROOM(state, roomId){
    state.currentRoom = roomId
  }
}

const actions = { 
  seed ({ rootState }) {
    let convoRef = rootState.db.collection('conversations')

    convoRef.add({
      created: Date.now(),
      users: ['mr_a', 'mr_b'],
      messages: [
        { id: uuidv4(), text: 'Hi there', sender: 'mr_a', created: Date.now() },
        { id: uuidv4(), text: 'Hi to you too!', sender: 'mr_b', created: Date.now() }
      ]
    })

    convoRef.add({
      created: Date.now(),
      users: ['mr_a', 'mr_c'],
      messages: []
    })
  },
  async createRoom ({ commit, rootState,state }){
    let convoRef = rootState.db.collection('conversations')
    convoRef.add({
      created: Date.now(),
      users: [],
      messages: []
    }).then(res => {

      lf.getItem('rooms').then(value => {
        
        if(value === null){
          lf.setItem('rooms', [])
        }

        const rooms = value
        rooms.push({id: res.id})
        lf.setItem('rooms', rooms)
        commit("SET_CURRENT_ROOM", res.id)
        
      })
    })

  },
  async enterRoom ({ commit, rootState,state }, obj) {

    commit('CLEAR_DATA')

    lf.getItem('rooms').then(value => {

      const result = _.find(value,{ 'id': obj.roomId})

      if (result === undefined) {
        const rooms = []
        rooms.push({id: obj.roomId})
        lf.setItem('rooms', rooms)
      } 

    })
    
    let convoRef = rootState.db.collection('conversations').doc(obj.roomId);
    
    convoRef.update({
      users: [obj.userId]
    }

    let allConvos = rootState.db.collection('conversations');

    let convos = await allConvos.get()

    const rooms = lf.getItem('rooms').then(value => {

      convos.forEach(conversation => {
        const result = _.find(value,{ 'id': conversation.id})

        if (result !== undefined){
          commit('SET_CONVERSATION', { conversation })
        }
      })
    })  
  },
  async get ({ commit, rootState }) {
    commit('CLEAR_DATA')

    let convoRef = rootState.db.collection('conversations')
    let convos = await convoRef.get()

    const rooms = lf.getItem('rooms').then(value => {

      convos.forEach(conversation => {
        const result = _.find(value,{ 'id': conversation.id})

        if (result !== undefined){
          commit('SET_CONVERSATION', { conversation })
        }
      })
    })  

  },
  sendMessage ({ commit, rootState }, { text, created, sender, conversationId }) {
    const convoRef = rootState.db.collection('conversations').doc(conversationId)

    convoRef.update({
      messages: [...state.all[conversationId].messages, { id: uuidv4(), created, sender, text }]
    })
    .then(res => console.log('Message sent.'))
    .catch(err => console.log('Error', err))
  },
  setCurrentRoom ({commit, state},roomId){
    commit("SET_CURRENT_ROOM", roomId)
  }
}

export default { namespaced: true, state, mutations, actions }