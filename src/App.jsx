import Header from "./components/Header"
import Search from "./components/Search"
import Footer from "./components/Footer"
import About from "./Pages/About"
import{BrowserRouter, Routes, Route} from 'react-router-dom'
import Home from "./Pages/Home"
import CardPlace from "./components/CardPlace"
function App(){
  return(
    <BrowserRouter>
        <Header/>
      <Routes>
        <Route path="/" element = {<Home/>}/>
        <Route path="/about" element = {<About/>}/>
        <Route path="/destinaton" element = {<h1></h1>}/>
        </Routes>
    </BrowserRouter>
  )
}
export default App