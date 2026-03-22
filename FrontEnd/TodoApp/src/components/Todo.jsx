import axios from "axios";
import React from 'react'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

const Todo = () => {
  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center px-4 py-12 font-mono">
      <div className="container  w-full max-w-md" >
        <div className="mb-8">
          <div className="flex items-baseline gap-3 mb-2">
              <span className="text-[16px] text-green-900 tracking-[0.2em] uppercase">◆ tasklog</span>
              <span className="text-[16px] text-gray-950 tracking-widest">progress% complete</span>
          </div>
          <div className="h-0.5 bg-[#111418] rounded-full overflow-hidden">
          <div className="h-full bg-green-600 rounded-full transition-all duration-500
           w-1/2" >
          </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-5 bg-[#0d1117] border-[#1a2030] rounded-md py-1">
          <span className="text-green-700 text-sm tracking-widest select-none">›</span>
          <input type="text" placeholder="new task...." className="flex-1 bg bg-transparent border-none outline-none text-green-600 text-[13px]tracking-wide placeholder:text-green-600 py-1.5 caret-green-600" />
          <button
            className="w-8 h-8 flex items-center justify-center bg-[#0f1f0f] border border-[#1a3a1a] text-green-700 text-lg rounded hover:bg-[#142614] hover:text-green-500 transition-colors mr-2"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}

export default Todo
