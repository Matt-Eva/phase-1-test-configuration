import fs from 'fs'
import path from 'path'
import { getData, createEventListener } from './index.js'

const html = fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf-8')

const css = fs.readFileSync(path.resolve(__dirname, './styles.css'), 'utf-8')

document.documentElement.innerHTML = html
const style = document.createElement('style')
style.innerHTML = css
document.head.append(style)

describe('query DOM', () =>{
    // document.body.innerHTML = html
    // document.head.innerHTML = html
    it('has a button', () =>{
        const button = document.querySelector('button')
        expect(button).not.toBe(null)
    })
    it('can call events', () =>{
        createEventListener()
        const button = document.getElementById("click-me")
        button.click()
        const h2 = document.querySelector('h2')
        console.log(h2)
        expect(h2).not.toBe(null)
    })
    it('can query CSS', () =>{
      const button = document.getElementById("click-me")
      const styles = window.getComputedStyle(button)
      console.log(styles)
      expect(styles.color).toBe('blue')
    })
    it('can find head', () =>{
      const link = document.head.querySelector("link[rel='stylesheet'][href='./styles.css']")
      expect(link).not.toBe(null)
    })
  })

describe('getData', () => {
    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ data: 'mock data' }),
        })
      );
    });
  
    afterEach(() => {
      global.fetch.mockClear();
      delete global.fetch;
    });
  
    it('should call the API', async () => {
      await getData();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/data');
    });
  
    it('should return data from the API', async () => {
      const data = await getData();
      expect(data).toEqual({ data: 'mock data' });
    });
  
    it('should log an error if the API call fails', async () => {
      global.fetch.mockImplementationOnce(() => Promise.reject('API is down'));
      console.error = jest.fn();
  
      await getData();
      expect(console.error).toHaveBeenCalledWith('API is down');
    });
  });

 