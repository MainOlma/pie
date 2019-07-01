import React, {useState, useEffect} from 'react';
import * as d3 from 'd3';


function Triangle(props) {
    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }
    let svg_ref = React.createRef();

    const [render,setRender] = useState(0)
    useEffect(() => {
        console.log(props.data.length,props.fills.length,render,"hook")
        if( props.data.length!=0 && props.fills.length!=0 && render==0) draw()
    },)


    const draw = () =>{
        let svg = d3.select(svg_ref.current)
        console.log(svg,svg_ref)

        const data=props.data,
            fills=props.fills

        const nested = d3.nest().key(d => d).rollup(d => d.length).entries(fills)
            .sort((a, b) => d3.descending(a.value, b.value));

        const popular_fills = nested.slice(0, 7)
        let popular_fills_names = popular_fills.map(d => d.key)

        const other_fills = nested.slice(8)
        const other_fills_names = other_fills.map(d => d.key)


        data.forEach((d) => {
            d.mod_fill_1 = (!popular_fills_names.includes(d.fill_1)) ? "Other" : d.fill_1
            d.mod_fill_2 = (!popular_fills_names.includes(d.fill_2)) ? "Other" : d.fill_2
        })

        popular_fills_names = popular_fills_names.filter(el => el != "None")

        //console.log("replaced with other", mydata)

        popular_fills_names.push("Other")

        //drawListOfPies()

        const table = []
        //let svg = d3.select("#root").append("svg")
        //svg.attr("width", 500).attr("height", 500)
        const g_lines = svg.append("g").attr("class", "lines"),
            g_texts = svg.append("g").attr("class", "texts")

        popular_fills_names.forEach((fill_1, i) => {

            let xx = 0


            const hor_gap = 100,
                hor_gap_line = hor_gap + 25,
                start_y = 25

            svg.append("text").attr("x", xx * 20).attr("y", i * 40 + start_y).text(fill_1).classed(fill_1, true)

            for (var j = i; j <= popular_fills_names.length - 1; j++) {

                const fill_2 = popular_fills_names[j]
                xx++

                let filter = data.filter(el => ((el.mod_fill_1 == fill_1 && el.mod_fill_2 == fill_2) || (el.mod_fill_1 == fill_1 && el.mod_fill_2 == "None" && fill_1 == fill_2)))
                let filter2 = data.filter(el => ((el.mod_fill_2 == fill_1 && el.mod_fill_1 == fill_2 && fill_1 != fill_2)))



                g_texts.append("circle")
                    .attr("r", (d)=>(filter.length + filter2.length>0) ? 8 : 0)
                    .attr("cx", xx * 20 + hor_gap + 5)
                    .attr("cy", i * 20 + j * 20 + start_y - 5)
                    .classed( fill_1, true)
                    .classed( fill_2, true)
                    .on("mouseover", function () {
                        props.selectedFill({f1:fill_1,f2:fill_2})
                    })
                    .on("mouseout", function () {
                        props.selectedFill({f1:"none",f2:"none"})
                    })

                g_texts.append("text")
                    .attr("x", xx * 20 + hor_gap + 5)
                    .attr("y", i * 20 + j * 20 + start_y)
                    .text(()=> (filter.length + filter2.length>0) ? filter.length + filter2.length : "")
                    .classed("row_" + fill_1, true)
                    .classed("col_" + fill_2, true)
                    .attr("pointer-events","none")

                table.push({
                        fill_1: fill_1,
                        fill_2: fill_2,
                        count: filter.length + filter2.length
                    }
                )
            }

            g_lines.append("line")
                .attr("x1", hor_gap_line)
                .attr("y1", i * 40 + 20)
                .attr("x2", xx * 20 + hor_gap_line - 15-5)
                .attr("y2", i * 20 + j * 20-5+5)
                .attr("stroke", "green")
                .attr("class", fill_1)

            g_lines.append("line")
                .attr("x1", hor_gap_line)
                .attr("y1", i * 40 + 20)
                .attr("x2", (i) * 20 + hor_gap_line)
                .attr("y2", i * 40 + 20 - (7 - xx) * 20)
                .attr("stroke", "blue")
                .attr("class", fill_1)

        })
        popular_fills_names.forEach((fill_1, i) => {

            svg.selectAll("text." + fill_1).on("mouseover", function () {

                const selectedFill=d3.select(this).attr("class")

                props.selectedFill({f1:selectedFill,f2:"none"})

                svg.selectAll("text").classed("hovered", false)
                d3.select(this).classed("hovered", true)

                svg.selectAll("text.col_" + selectedFill).classed("hovered", true)
                svg.selectAll("text.row_" + selectedFill).classed("hovered", true)

                g_lines.selectAll("line").classed("hovered", false)
                g_lines.selectAll("line." + selectedFill).classed("hovered", true)

                g_texts.selectAll("circle").classed("hovered", false)
                g_texts.selectAll("circle." + selectedFill).classed("hovered", true)

            })
                .on("mouseout", function () {
                    props.selectedFill({f1:"none",f2:"none"})
                    svg.selectAll("text").classed("hovered", false)
                    g_lines.selectAll("line").classed("hovered", false)
                    g_texts.selectAll("circle").classed("hovered", false)
                   // pie_container.selectAll("span").style("color", "black")

                })
        })

        setRender(1)
    }

    return (
        <div className="triangle">
            <h3>Filling filter</h3>
            <svg ref={svg_ref} width={260} height={300}/>
        </div>
    );
}

export default Triangle;
