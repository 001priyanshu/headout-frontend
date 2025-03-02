const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL


export async function fetchDestination() {
    const res = await fetch(`${API_BASE_URL}/destinations/`);
    const data = await res.json();
    return data;
  }

export async function checkDestinationAnswer(destinationId: string, selectedAnswer: string) {
    if(!destinationId || !selectedAnswer){
        throw new Error("Invalid data");
    }
    const res = await fetch(`${API_BASE_URL}/destinations/answer`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: destinationId, selectedAnswer }),
    });
  
    const data = await res.json();
    return data;
  }