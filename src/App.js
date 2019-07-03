import React, {useState, useEffect} from 'react';
import * as d3 from 'd3';
import './App.css';
import pie from './img/pie.png';



//<img src={images['doggy.png']} />

import Triangle from "./Triangle";

function App() {
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }




    const pieContainer_ref = React.createRef()

    const [data, setData] = useState([]);
    const [fills, setFills] = useState([]);
    const [selectedFill, setSelectedFill] = useState({"f1": "none", "f2": "none"})

    useEffect(() => {

        const fetchData = () => {
            d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vTT_w_1rgvRuiIkhgZ7GGjhWdxNTY2zuFEsuT7AtK80ryUlPZMN96ROjIljXTAewLEm6CClM5HwIiFv/pub?gid=0&single=true&output=csv").then(function (raw_data) {
                const fills = [];
                const parseDate = d3.timeParse("%Y-%m-%d");

                let mydata = raw_data.map((el, i) => {

                    const fill_1 = (el['primary filling'] != "") ? el['primary filling'].replace(" ", "_") : "None",
                        fill_2 = (el['secondary filling'] != "") ? el['secondary filling'].replace(" ", "_") : "None"

                    fills.push(fill_1)
                    fills.push(fill_2)

                    return {
                        //Pie	Date served	Recipe	one-crust	two crust	primary filling	secondary filling	Notes	alec will eat it	Image	Is this pie?
                        id: i,
                        name: el['Pie'],
                        date: parseDate(el['Date served']),
                        alec: el['alec will eat it'],
                        crust: (el['one-crust'] && !el['two crust']) ? 1 : 2,
                        img:el[Image],
                        notes: el['Notes'],
                        is_pie: el['Is this pie?'],
                        recipe: el['Recipe'],
                        fill_1: fill_1,
                        fill_2: fill_2
                    }
                })
                const nested = d3.nest().key(d => d).rollup(d => d.length).entries(fills)
                    .sort((a, b) => d3.descending(a.value, b.value));

                const popular_fills = nested.slice(0, 7)
                let popular_fills_names = popular_fills.map(d => d.key)

                mydata.forEach((d) => {
                    d.mod_fill_1 = (!popular_fills_names.includes(d.fill_1)) ? "Other" : d.fill_1
                    d.mod_fill_2 = (!popular_fills_names.includes(d.fill_2)) ? "Other" : d.fill_2
                })
                setData(mydata)
                setFills(fills)


            })

        }

        fetchData();

    }, []);

    /*change state on hover of triangle table*/
    useEffect(() => {
        drawListOfPies(data);
    },[data])

    /*effect when nothing is hoveread or hovered a number*/
    useEffect(()=>{
        if (selectedFill.f1==="none") d3.selectAll("span.pie").classed("activeItem",true).classed("unactiveItem",false)
        else {
            d3.selectAll("span.pie").classed("unactiveItem",true)

            if (selectedFill.f2==="none"){
                d3.selectAll("span.pie."+selectedFill.f1).classed("unactiveItem",false)
            }
            else {
                d3.selectAll("span.pie")
                    .filter((d) =>
                        (d.mod_fill_1 === selectedFill.f1 && d.mod_fill_2 === selectedFill.f2)
                        || (d.mod_fill_1 === selectedFill.f2 && d.mod_fill_2 === selectedFill.f1)
                        || (d.mod_fill_1 === selectedFill.f1 && d.mod_fill_2 === "None" && selectedFill.f1===selectedFill.f2))
                .classed("unactiveItem",false)
            }

        }
    })

    const drawListOfPies = (data) =>{

        function importAll(r) {
            let images = {};
            r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
            return images;
        }

        const images = importAll(require.context('./img', false, /\.(png|jpe?g|svg)$/));

        let pie_container = d3.select(pieContainer_ref.current)

        const format = d3.timeFormat("%Y %B"); /*format date for nesting data by months*/

        const nested_by_date = d3.nest().key(d => {
            return format(d.date);
        }).entries(data)

        //console.log("pie by date", nested_by_date)

        const month_div = pie_container.selectAll("div.pies_in_month").data(nested_by_date).enter().append("div").classed("pies_in_month",true)

        month_div.append("div").classed("month_name", true)
            .html((d) => {
                const formatMonth = d3.timeFormat("%B")
                const formatYear = d3.timeFormat("%Y")
                const parseTime = d3.timeParse("%Y %B")
                const month = "<span class='month_wrapper'><span class='month'>"+formatMonth(parseTime(d.key))+"</span></span>"
                const year = "<span class='year year"+formatYear(parseTime(d.key))+"'>"+formatYear(parseTime(d.key))+"</span>"
                return year + month
            })

        pie_container.selectAll(".year2018").filter((d, i) => i == 0).classed("visible",true)
        pie_container.selectAll(".year2019").filter((d, i) => i == 0).classed("visible",true)
        pie_container.selectAll(".year2020").filter((d, i) => i == 0).classed("visible",true)

        if (pie_container.select(".year2019").node()) {
            const element = pie_container.select(".year2019").node().parentNode.parentNode
            const parent = pie_container.select(".year2019").node().parentNode.parentNode.parentNode
            const div = document.createElement('div');
            div.className = "line_breaker";
            parent.insertBefore(div, element);

        }


         month_div.append("div").classed("pies_list", true).selectAll("span.pie").data(d => d.values).enter().append("span").classed("pie", true)
            .html((e,i,a) => {
                const pie_img = (images[e.name+".png"]) ? images[e.name+".png"] : pie
                e.pie_img=pie_img
                const formatDay = d3.timeFormat("%e")
                const parseTime = d3.timeParse("%Y %B %e")
                return "<span class='number "+wrapClass(e,a[i+1])+hideClass(e,a[i-1])+"'>"+formatDay(e.date)+"</span><img alt='"+e.name+"' src=\""+pie_img+"\" width='88' height='88'>"
            })
            .attr("class", (d, i, a) => "pie " + d.fill_1 + " " + d.fill_2 + " " + d.mod_fill_1 + " " + d.mod_fill_2+ " " + activeClass(d.fill_1, d.fill_2) + wrapClass(d,a[i+1]))
            .on("mouseenter", showDetail)
            .on("mouseleave", hideDetail)

        let month_wrappers=pie_container.node().querySelectorAll('.pies_in_month')

        month_wrappers.forEach((wrapper) => {
                unwrap(wrapper);
            });

        let pie_wrappers=pie_container.node().querySelectorAll('.pies_list')
        pie_wrappers.forEach((wrapper) => {
            unwrap(wrapper);
        });



        function unwrap(wrapper) {
            if (wrapper) {
                // place childNodes in document fragment
                var docFrag = document.createDocumentFragment();
                while (wrapper.firstChild) {
                    var child = wrapper.removeChild(wrapper.firstChild);
                    docFrag.appendChild(child);
                }

                // replace wrapper with document fragment
                wrapper.parentNode.replaceChild(docFrag, wrapper);
            }
        }




        function showDetail(dd) {
            d3.select(".tooltip").remove()
            console.log("hover")
            d3.select("body").append("div").classed("tooltip", true)
                .html(() =>
            {
                const d =dd
                const formatDay = d3.timeFormat("%A, %B %e, %Y")

                return "<img  alt='"+d.name + "' src='" + d.pie_img + "' width='256' height='256'> <div class='details'>"
                    + "<div class='date'>" +formatDay(d.date) + "</div>"
                    + "<div class='name'><a href='"+d.recipe+"'>" +d.name + "</a></div>"
                    + "<div class='fill'>" +d.fill_1 + ((d.fill_2!='None' && d.fill_1!=d.fill_2) ? " and "+d.fill_2 : "") + ", "+ ((d.crust===1) ? "one crust" : "two crusts")+"</div>"
                    + ((d.notes) ? "<div class='notes'>"+d.notes+"</div>" : "")
                    + "<div class='is_pie'> — Is this pie? <br> — "+d.is_pie+"</div>"
                    + "<div class='alec'> — Will Alec eat it? <br> — "+d.alec+"</div></div>"
            })
                .style("left", d3.select(this).node().getBoundingClientRect().left - 88 + "px")
                .style("top", d3.select(this).node().getBoundingClientRect().top+window.scrollY + 140 + "px")
                //.classed("hovered", true)
                .on("mouseenter",function () {
                    console.log("hovered", this)
                    d3.select(this).classed("hovered", true)
                })
                .on("mouseleave",function () {

                    d3.select(this).classed("hovered", false)
                    d3.select(this).classed("not_hovered", true)
                    console.log("not hovered",this)
                   d3.select(this).remove()
                })
        }

        function hideDetail(d) {
           if (d3.select(".tooltip").classed("not_hovered"))


           d3.selectAll(".tooltip").remove()
        }

    }



    const handleSelectedFill = (value) =>{
        setSelectedFill(value)
    }

    const activeClass = (f1,f2) =>{

        if ((f1===selectedFill.f1 || f2===selectedFill.f1) && selectedFill.f2==="none")
            {console.log(f1,f2,selectedFill)
            return " activeItem "}
        if (f1===selectedFill.f1 && f2===selectedFill.f2)
        {console.log(f1,f2,selectedFill)
            return " activeItem "}

        return " unactiveItem "
    }

    const wrapClass = (d,g) =>{
        if (g && d.date.getTime() === g.__data__.date.getTime()) {
            return " wrapPie "
        }
    }

    const hideClass = (d,g) =>{
        if (g && d.date.getTime() === g.__data__.date.getTime()) {
            return " invisibleNumber "
        }
    }

    return (<div>
            <div className="left_side">
                <div className="sticky_top">
                <h1>The Pie Chart</h1>
                <h2>The pies proudly eaten by the Stamen team</h2>

                    <Triangle data={data} fills={fills} selectedFill={handleSelectedFill}/>

                </div>
                <div className="unsticky" />
                <div className="sticky_bottom">
                    <div className="footer">
                        Made by <a href="https://kmpny.github.io">Kompany</a>, <a href="https://docs.google.com/spreadsheets/d/1npXQKNySYcRpiwp3-Iug3ncmCUS9F813LoxZQzSbVLU/edit#gid=0">data</a> collected by <a href="https://stamen.com">Stamen</a>
                    </div>
                </div>
            </div>
            <div className="right_side">
                <div className="pies" ref={pieContainer_ref}/>
                <div className="bottom">Well done! Keep going!</div>
            </div>

        </div>);
}

export default App;
