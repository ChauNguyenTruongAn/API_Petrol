const getDay = (day, month, year) => {
    if (day && month && year) {
        let date = `${day}/${month}/${year} 15:00:00`;
        console.log(">>>Check date: ", date)
        const result = encodeURIComponent(date)
        console.log(">>>Check result: ", result)
        return result;
    }
    return null;
}

const getLink = (link) => {
    if (link) {
        return "https://www.petrolimex.com.vn" + link;
    }
    return "https://www.petrolimex.com.vn/"
}

const generateListDate = () => {
    const thursdays = [];
    const date = new Date();
    const currentDay = date.getDay();
    let diffToThursday;

    if (currentDay >= 4) {
        diffToThursday = currentDay - 4;
    } else {
        diffToThursday = currentDay + 3;
    }

    date.setDate(date.getDate() - diffToThursday);

    for (let i = 0; i < 50; i++) {

        thursdays.push(formatDate(date));
        date.setDate(date.getDate() - 7);
    }

    return thursdays;
};


const formatDate = (date) => {
    const newDate = new Date(date);
    const day = String(newDate.getDate()).padStart(2, '0');
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const year = newDate.getFullYear();
    return `${day}-${month}-${year}`;
};

const check = (title, id_user) => {

}

module.exports = {
    getDay,
    getLink,
    generateListDate,
    check
}