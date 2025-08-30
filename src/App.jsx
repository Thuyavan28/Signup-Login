import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg';
import Login from './login';
import Dashboard  from './dashboard';
import { Routes,Route } from 'react-router-dom';
import Forgot from './forgot';



function App() {

  return (
   <div className='grid w-[100%] h-screen place-items-center bg-cyan-600'>
    
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route  path='/dashboard' element= {<Dashboard/>} />
      <Route  path='/forgot' element= {<Forgot/>} />
    </Routes>
   </div>
   
  )
}

export default App;
