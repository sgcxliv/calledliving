.navbar {
  background-color: #444;
  display: flex;
  position: relative;
}

.navbar ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  width: 100%;
}

.navbar li {
  flex: 1;
  position: relative;
}

.navbar li > a {
  display: block;
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  transition: background-color 0.3s;
}

.navbar li > a:hover,
.navbar li > a.active {
  background-color: #666;
}

.dropdown {
  position: relative;
}

.dropdown-content {
  display: none;
  position: absolute;
  background-color: #555;
  width: 100%;
  left: 0;
  top: 100%;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  z-index: 1000;
}

.dropdown.active .dropdown-content {
  display: block;
}

.dropdown-content a {
  display: block;
  color: white;
  padding: 12px 16px;
  text-decoration: none;
  text-align: left;
}

.dropdown-content a:hover {
  background-color: #666;
}
