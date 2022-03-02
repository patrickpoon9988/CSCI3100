import './App.css';
import logo from './icon.png';

function App() {
    return (
        <div>
            <div>
                <nav class="navbar navbar-expand-lg">
                    <img src={logo} alt="icon" />
                    <div class="collapse navbar-collapse">
                        <ul class="navbar-nav">
                            <li class="nav-item">
                                <a href="#" class="link">Home </a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="link">About Us</a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="link">Service</a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="link">Contact</a>
                            </li>
                            <li class="nav-item">
                                <a href="#" class="link">Login</a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </div>

            <div class="container">
                <form id="form" action="/">
                    <h3>Registration</h3>
                    <div class="input-control">
                        <label for="username">Username</label>
                        <input id="username" name="username" type="text" placeholder="Username" />
                        <div class="error"></div>
                    </div>
                    <div class="input-control">
                        <label for="email">Email</label>
                        <input id="email" name="email" type="text" placeholder="Email" />
                        <div class="error"></div>
                    </div>
                    <div class="input-control">
                        <label for="password">Password</label>
                        <input id="password" name="password" type="password" placeholder="Password" />
                        <div class="error"></div>
                    </div>
                    <div class="input-control">
                        <label for="password2">Re-password</label>
                        <input id="password2" name="password2" type="password" placeholder="Re-Password" />
                        <div class="error"></div>
                    </div>
                    <button type="submit">Sign Up</button>
                    <br></br>
                    <p>Already have account?<a href="@"> Login</a></p>
                </form>
            </div>
        </div>
    );
}

export default App;
