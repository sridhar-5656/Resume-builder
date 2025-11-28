// Handle profile picture upload
document.getElementById("file").addEventListener("change", function(event) {
    const reader = new FileReader();
    reader.onload = function() {
        document.getElementById("profile-pic").src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
});

// Generate Resume
function generateResume() {
    // Show the resume output container
    document.getElementById("resume-output").style.display = "flex";

    // Get the input values and populate the resume preview
    document.getElementById("display-name").innerText = document.getElementById("name").value;
    document.getElementById("display-native").innerText = document.getElementById("native").value;
    document.getElementById("display-phno").innerText = document.getElementById("phno").value;
    document.getElementById("display-email").innerText = document.getElementById("email").value;
    document.getElementById("display-achievements").innerText = document.getElementById("achievements").value;
    document.getElementById("display-hobbies").innerText = document.getElementById("hobbies").value;
    document.getElementById("display-language").innerText = document.getElementById("languague").value;
    document.getElementById("display-course").innerText = document.getElementById("course").value;
    document.getElementById("display-year").innerText = document.getElementById("year").value;
    document.getElementById("display-percentage").innerText = document.getElementById("percentage").value;
    document.getElementById("display-technical").innerText = document.getElementById("technical").value;
    document.getElementById("display-nonTechnical").innerText = document.getElementById("nonTechnical").value;
}

// Download PDF
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    
    // Create a new jsPDF instance
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    // Get the resume content
    const resumeElement = document.getElementById("resume-output");

    // Use jsPDF's HTML method to directly render the content
    pdf.html(resumeElement, {
        callback: function (pdf) {
            // Save the generated PDF
            pdf.save("resume.pdf");
        },
        x: 10, // X position for the content (left margin)
        y: 10, // Y position for the content (top margin)
        width: 190, // Width of the content (set a margin for the right side)
        windowWidth: 800, // Specify the width of the window to scale the content accordingly
    });
}
