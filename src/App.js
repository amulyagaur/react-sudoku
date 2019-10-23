import React from 'react';
import './App.css';
import { throwStatement } from '@babel/types';

class Box extends React.Component{

  handleChange = (event)=>{
    this.props.handleInput(this.props.xCoord,this.props.yCoord,event.target.value);
  }

  render(){
    return(
    <>
      <input value={this.props.val} 
             size={1}
             onChange={this.handleChange}
             ></input>
    </>
    );
  }
}

class Board extends React.Component{

  handleBoardChange = (x,y,v)=>{
    this.props.onChanging(x,y,v);
  }

  render(){
    var htmljsx = [];
    for(var i=0;i<9;i++)
    {
      for(var j=0;j<9;j++)
      {
        htmljsx.push(<Box val={this.props.board[i][j]>0 ?this.props.board[i][j]:undefined} 
                          xCoord={i}
                          yCoord={j}
                          handleInput={this.handleBoardChange}
                          key={'key'+i+j}
                          />);
      }
      htmljsx.push(<br key={'key'+i}/>);
    }
    return(
    <div>
      {htmljsx}
    </div>
    );
  }
}

class App extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      board: [[],[],[],[],[],[],[],[],[]],
      message:'',
      sol:null
    }
  }

  alterState = (x,y,val)=>{
    var stateArray = this.state.board.slice();
    stateArray[x][y]=parseInt(val);
    this.setState({
      board:stateArray
    })
  }

  encodeBoard = (board) => 
  board.reduce((result, row, i) => result + `%5B${encodeURIComponent(row)}%5D${i === board.length -1 ? '' : '%2C'}`, '')


  encodeParams = (params) => 
  Object.keys(params)
  .map(key => key + '=' + `%5B${this.encodeBoard(params[key])}%5D`)
  .join('&');

  viewResult = ()=>{
    var solu = this.state.sol.slice();
    this.setState({
      board:solu
    })
  }

  checkSol = ()=>{
    var arr = this.state.board,solu=this.state.sol;
    if(JSON.stringify(arr)==JSON.stringify(solu))
      this.setState({
        message:'Correct Solution :)'
      })
    else  
      this.setState({
        message:'Incorrect Solution :('
      })
  }

  render(){
    return(
      <div>
        <p>Sudoku</p>
        <Board board={this.state.board} onChanging={this.alterState}/>
        <p>{this.state.message}</p>
        <button type="button" onClick={this.viewResult}>View Result</button>
        <button type="button" onClick={this.checkSol}>Check Solution</button>
      </div>
    )
  }

  componentDidMount(){
    fetch("https://sugoku.herokuapp.com/board?difficulty=easy")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            board: result.board
          });
          const data = {board:this.state.board}

          fetch('https://sugoku.herokuapp.com/solve', {
            method: 'POST',
            body: this.encodeParams(data),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          })
          .then(response => response.json())
          .then(response => this.setState({
            sol:response.solution
          }))
          .catch(console.warn)
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            board: null
          });
        }
      )
  }
}

export default App;