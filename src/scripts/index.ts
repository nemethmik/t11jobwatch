interface ReqResUser {
    name: string,
    job: string,
}
interface ReqResCreated {
    id: number,
    createdAt: Date,
}
// This function doesn't have to be async since it just sends the request, but will not wait for the response.
const signup = ():void => {
        const nameValue = getInputValue("name")
        const jobValue = getInputValue("job")

        invokeAPIAsync({
            name: nameValue,
            job: jobValue
        })
    }

const successAlert = (id:string):void => {
        window.alert(`User with id ${id} successfully added.`)
    }
const errorAlert = (error:string):void => {
    window.alert(error)
}

const invokeAPIAsync = async (data: ReqResUser) => {
    const url = "https://reqres.in/api/users"
    try{
        const response = await fetch(url,
            {method:"POST",body: JSON.stringify(data)})
        if(response.ok) {
            const u = await response.json()
            if(u.createdAt) {
                console.log(`Created at ${u.createdAt} with id ${u.id}`)
                successAlert(u.id)
            } else errorAlert(`Hmm, unknown object returned ${u}`)
        } else {
            errorAlert(`Not OK:${response.status} ${response.statusText}`)
        }
    } catch(e) {
        errorAlert(`Something is wrong with ${url} ${e}`)
    }
}

// const invokeAPI = (data: any):void => {
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", "https://reqres.in/api/users");
//     xhr.send(data);
//     xhr.onload = successAlert;
// }

const getInputValue = (controlName: string): string => {
        const el:HTMLElement | null = document.getElementById(controlName)
        if(el && el instanceof HTMLInputElement) {
            return el.value
        } else {
            throw new Error("No HTMLInputElement found with id " + controlName)
        }
    }

function submitUserDetails():boolean {
    signup()
    return false
}
