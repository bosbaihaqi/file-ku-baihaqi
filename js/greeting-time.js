function updateGreetingTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  let period = hours >= 12 ? 'PM' : 'AM';
  let hour12 = hours % 12 || 12;

  let greeting = "Good morning";
  if (hours >= 12 && hours < 16) greeting = "Good afternoon";
  else if (hours >= 16 || hours < 4) greeting = "Good evening";

  const timeString = `${greeting}, ${hour12}:${minutes}:${seconds} ${period}`;
  const el = document.getElementById("greetingTime");
  if (el) el.textContent = timeString;
}

setInterval(updateGreetingTime, 1000);
updateGreetingTime();
