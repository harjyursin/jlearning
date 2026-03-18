// Dark mode
function toggleDark() {
    document.body.classList.toggle("bg-gray-900");
    document.body.classList.toggle("text-white");
  }
  
  // Skeleton
  setTimeout(() => {
    const s = document.getElementById("skeleton");
    const c = document.getElementById("content");
    if (s && c) {
      s.style.display = "none";
      c.classList.remove("hidden");
    }
  }, 1200);
  
  // Video resume
  const video = document.getElementById("video");
  if (video) {
    video.addEventListener("timeupdate", () => {
      localStorage.setItem("videoTime", video.currentTime);
    });
  
    const saved = localStorage.getItem("videoTime");
    if (saved) video.currentTime = saved;
  }
  
  // Avatar
  function changeAvatar(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      document.getElementById("avatar").src = reader.result;
    };
    reader.readAsDataURL(file);
  }