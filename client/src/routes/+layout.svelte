<nav>
	<h1><a href="/" id="home-link">Duck Checkers</a></h1>
	<button>Login</button>
</nav>

<slot />

<style>
	nav {
		height: 50px;
		width: 100%;
		/* background-color: grey; */
		display: inline-flex;
		justify-content: space-between;
	}

	a#home-link {
		position: absolute;
		top: 5px;
		text-decoration: none;
		color: yellow;
		font-family: fantasy;
		font-size: 1.4em;
	}
</style>
