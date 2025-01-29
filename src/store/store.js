import {makeAutoObservable} from "mobx";
import AuthService from "../services/AuthService";

export default class Store {

    user = {} ;
    isAuth = false;
    isAuthInProgress = false;

    constructor() {
        makeAutoObservable(this)
    }

    setAuth(bool){
        this.isAuth = bool;
    }

    setUser(user){
        this.user = user;
    }

    async login(username, password){
        this.isAuthInProgress = true;
        try {
            const response = await AuthService.login(username,password);
            console.log(response)
            sessionStorage.setItem('tokenAutomationProduction', response.data.uuid);
            await this.checkAuth()
        } catch (e){
            console.log(e.response?.data?.message)
        } finally {
            this.isAuthInProgress = false;
        }
    }

    async logout(){
        try {
            // const response = await AuthService.logout(); //не реализовано на сервере
            sessionStorage.removeItem('tokenAutomationProduction');
            this.setAuth(false);
            this.setUser({});
        } catch (e){
            console.log(e.response?.data?.message)
        }
    }

    async checkAuth(){
        this.isAuthInProgress = true;
        try {
            const response = await AuthService.getAuthorizedUserData(); //временно, после доделать запрос на refresh и валидность токена
            // console.log(response)
            this.setAuth(true);
            this.setUser(response.data);
        } catch (e){
            console.log(e.response?.data?.message)
        } finally {
            this.isAuthInProgress = false;
        }
    }

    async updateAuth(){
        try {
            const response = await AuthService.getAuthorizedUserData(); //временно, после доделать запрос на refresh и валидность токена
            // console.log(response)
            this.setAuth(true);
            this.setUser(response.data);
        } catch (e){
            console.log(e.response?.data?.message)
        }
    }

}