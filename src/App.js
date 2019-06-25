import React, {useState, useEffect} from 'react';
import * as d3 from 'd3';
import './App.css';
import pie from './img/pie.png';

import Triangle from "./Triangle";

function App() {
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

    const pieContainer_ref = React.createRef()

    const [data, setData] = useState([]);
    const [fills, setFills] = useState([]);
    const [selectedFill, setSelectedFill] = useState("none")

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
                        id: i,
                        name: el['Pie'],
                        date: parseDate(el['Date served']),
                        alec: el['alec will eat it'],
                        crust: (el['one-crust'] && !el['two crust']) ? 1 : 2,
                        img:el[Image],
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
    })

    /*effect when nothing is hoveread*/
    useEffect(()=>{
        if (selectedFill==="none") d3.selectAll("span.pie").classed("activeItem",true).classed("unactiveItem",false)
        else {
            d3.selectAll("span.pie").classed("unactiveItem",true)
            d3.selectAll("span.pie."+selectedFill).classed("unactiveItem",false)
        }
    })

    const drawListOfPies = (data) =>{

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
                const month = formatMonth(parseTime(d.key))
                const year = "<span class='year"+formatYear(parseTime(d.key))+"'>"+formatYear(parseTime(d.key))+"</span>"
                return year + month
            })

        pie_container.selectAll(".year2018").filter((d, i) => i == 0).classed("visible",true)
        pie_container.selectAll(".year2019").filter((d, i) => i == 0).classed("visible",true)
        pie_container.selectAll(".year2020").filter((d, i) => i == 0).classed("visible",true)

        if (pie_container.select(".year2019").node()) {
            const element = pie_container.select(".year2019").node().parentNode.parentNode
            const parent = pie_container.select(".year2019").node().parentNode.parentNode.parentNode
            console.log(element)

            const div = document.createElement('div');
            div.className = "line_breaker";
            parent.insertBefore(div, element);

        }


         month_div.append("div").classed("pies_list", true).selectAll("div.pie").data(d => d.values).enter().append("span").classed("pie", true)
            .html((e) => {
                console.log(pie)
                return "<img alt='"+e.name+"' src='"+pie+"' width='50'>"
            })
            .attr("class", (d, i, a) => "pie " + d.fill_1 + " " + d.fill_2 + " " + d.mod_fill_1 + " " + d.mod_fill_2+ " " + activeClass(d.fill_1, d.fill_2) + wrapClass(d,a[i+1]))
            .on("mouseover", showDetail)
            .on("mouseout", hideDetail)



        function showDetail(d) {
            d3.select("body").append("div").classed("tooltip", true)
                .html("<img  alt='"+d.name+"' src='"+pie+"' width='256' height='256'> <div class='details'>"
                    + "crust: " + d.crust + "<br>"
                    + "alec: " + d.alec + "<br>"
                    //+ "date: " + d.date + "<br>"
                    + "fill 1: " + d.fill_1 + "<br>"
                    + "fill 2: " + d.fill_2 + "<br>"
                +"</div>")
                .style("left", d3.select(this).node().getBoundingClientRect().left - 88 + "px")
                .style("top", d3.select(this).node().getBoundingClientRect().top + 50 + "px")
        }

        function hideDetail(d) {
            d3.select(".tooltip").remove()
        }

    }



    const handleSelectedFill = (value) =>{
        setSelectedFill(value)

    }

    const activeClass = (f1,f2) =>{

        if (f1===selectedFill || f2===selectedFill)
            {//console.log(f1,f2,selectedFill)
            return "activeItem"}
        return "unactiveItem"
    }

    const wrapClass = (d,g) =>{
        if (g && d.date.getTime() === g.__data__.date.getTime()) {
            return " wrapPie "
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
            </div>

        </div>);
}

export default App;
