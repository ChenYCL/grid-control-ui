<template>
  <div>
    <div class="container mx-auto px-4 sm:px-8">
      <div class="py-8">
        <div class="flow-root">
          <h2 class="text-2xl font-semibold leading-tight float-left">
            数据  {{ data.time }}
          </h2>
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full  font-semibold float-right "
            @click="() => toggle(true)"
          >
            添加策略
          </button>
        </div>
        <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div class="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
            <table class="min-w-full leading-normal">
              <thead>
                <tr>
                  <th
                    class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    币种/symbol
                  </th>
                  <th
                    class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    参数a
                  </th>
                  <th
                    class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    参数b
                  </th>
                  <th
                    class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    count/数量
                  </th>
                  <th
                    class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    dx/差分
                  </th>
                  <th
                    class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    size/大小
                  </th>
                  <th
                    class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Status/状态
                  </th>
                  <th
                    class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Option/操作
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(value, key) in data.list" :key="key">
                  <td class="px-5 py-5 border-b border-gray-200 bg-white  text-center text-sm">
                    {{ key }}
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-center text-sm">
                    {{ value['参数'].a }}
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-center text-sm">
                    {{ value['参数'].b }}
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-center text-sm">
                    {{ value['参数'].count }}
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center ">
                    {{ value['参数'].dx }}
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-center text-sm">
                    {{ value['参数'].size }}
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-center  text-sm">
                    <span class="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                      <span aria-hidden class="absolute inset-0 bg-red-200 opacity-50 rounded-full" />
                      <span class="relative">
                        {{ value['运行中'] ? '开' : '关' }}
                      </span>
                    </span>
                  </td>
                  <td class="px-5 py-5 border-b border-gray-200 bg-white text-center  text-sm">
                    <span class="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                      <span aria-hidden class="absolute inset-0" />
                      <span v-if="value['运行中']" class="relative" @click="() => stop(key)">
                        <!-- 开启停止 -->
                        <img
                          width="48" height="48"
                          src="data:image/png;base64,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"
                        >

                      </span>
                      <span v-else class="relative" @click="() => start(key)">
                        <!-- 停止开启 -->
                        <img
                          width="48" height="48"
                          src="data:image/png;base64,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"
                        >
                      </span>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="visible">
        <div class="absolute bg-black opacity-70 inset-0 z-0" @click="toggle" />
        <div
          class="w-full max-w-lg p-1  mx-auto my-auto rounded-xl shadow-lg bg-white absolute top-10 m-auto left-0 right-0"
        >
          <div>
            <div class=" p-3 flex-auto justify-center leading-6">
              <h4 class="text-2xl font-semibold">
                添加策略
              </h4>
              <div class="relative w-full mb-3 mt-1">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="full-name">币种</label>
                <input
                  v-model="params.symbol" type="text"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
                  placeholder="币种" style="transition: all 0.15s ease 0s;"
                >
              </div>
              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="email">参数a</label>
                <input
                  v-model="params.a" type="number"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
                  placeholder="参数a" style="transition: all 0.15s ease 0s;"
                >
              </div>
              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="email">参数b</label>
                <input
                  v-model="params.b" type="number"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
                  placeholder="参数b" style="transition: all 0.15s ease 0s;"
                >
              </div>
              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="email">数量</label>
                <input
                  v-model="params.count" type="number"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
                  placeholder="数量" style="transition: all 0.15s ease 0s;"
                >
              </div>
              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="email">DX</label>
                <input
                  v-model="params.dx" type="number"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
                  placeholder="DX" style="transition: all 0.15s ease 0s;"
                >
              </div>
              <div class="relative w-full mb-3">
                <label class="block uppercase text-gray-700 text-xs font-bold mb-2" for="email">大小</label>
                <input
                  v-model="params.size" type="number"
                  class="px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:shadow-outline w-full"
                  placeholder="大小" style="transition: all 0.15s ease 0s;"
                >
              </div>
            </div>
            <div class="p-3 mt-2 text-center space-x-4 md:block">
              <button
                class="mb-2 md:mb-0 bg-white px-5 py-2 text-sm shadow-sm font-medium tracking-wider border text-gray-600 rounded-md hover:shadow-lg hover:bg-gray-100"
                @click="add"
              >
                确定
              </button>
              <button
                class="mb-2 md:mb-0 bg-purple-500 border border-purple-500 px-5 py-2 text-sm shadow-sm font-medium tracking-wider text-white rounded-md hover:shadow-lg hover:bg-purple-600"
                @click="() => toggle(false)"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang='ts' setup>
import { reactive, ref } from 'vue'
import { RealDBSyncClient } from '@/_____lib/RealDB/RealDBSyncClient'
import { server__funcList } from '@/_____server/server__funcList'
import { server__newRealDB } from '@/_____server/server__newRealDB'
import { error, success } from '@/components/common/NotificationPlugin'

export interface res {
  [symbol: string]: {
    运行中: boolean
    参数: {
      a: number
      b: number
      count: number
      size: number
      dx: number
    }
  }
}

const data = reactive({
  list: {},
  time: '00:00:00',
})
const visible = ref<boolean>(false)
const params = reactive({
  symbol: '',
  a: 0,
  b: 0,
  count: 0,
  size: 0,
  dx: 0,
})
const pwd = localStorage.getItem('password')
const client = new RealDBSyncClient({
  url: `ws://127.0.0.1:6061/${pwd}`,
  // url: 'ws://127.0.0.1',

  realDB: server__newRealDB(),
  funcList: server__funcList,
})

// console.log(client, client.realDB.mutableData.dic)

// set value
data.list = client.realDB.mutableData.dic

client.onData.subscribe(() => {
  console.log('__data__', JSON.stringify(data)) // data改不了？？？
  console.log('time', client.realDB.mutableData.time)
  data.list = { ...data.list, ...client.realDB.mutableData.dic }
  data.time = client.realDB.mutableData.time
})

const toggle = (bool: boolean) => {
  visible.value = bool
  if (!bool) {
    params.symbol = ''
    params.a = 0
    params.b = 0
    params.count = 0
    params.size = 0
    params.dx = 0
  }
  console.log(params)
}

const add = () => {
  if (params.symbol !== '' && params.a !== 0 && params.b !== 0 && params.count !== 0 && params.size !== 0 && params.dx !== 0) {
    client.func.set({
      symbol: params.symbol,
      参数: {
        a: params.a,
        b: params.b,
        count: params.count,
        size: params.size,
        dx: params.dx,
      },
    })
    toggle(false)
    success(`${params.symbol} 已添加`)
  } else {
    error('请填写完整')
  }
}

const stop = (symbol: string) => {
  console.log(`关闭${symbol}`)
  success(`关闭${symbol}`)
  client.func.stop({
    symbol,
  })
}

const start = (symbol: string) => {
  console.log(`开启${symbol}`)
  success(`开启${symbol}`)
  client.func.start({
    symbol,
  })
}
</script>

<route lang='yaml'>
name: Home
meta:
layout: authLayout
</route>

<style scoped>
</style>
