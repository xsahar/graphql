// Helper function to create SVG element
function createSVG(width, height) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    return svg;
}

// Draw audit ratio pie chart
function drawAuditRatioPieChart(totalUp, totalDown) {
    const container = document.getElementById('auditGraph');
    
    // Add null check
    if (!container) {
        console.warn('Audit Ratio Graph container not found in DOM');
        return;
    }
    
    let totalDoneInMB = (totalDown / 1000000).toFixed(2); 
    let totalReceivedInMB = (totalUp / 1000000).toFixed(2);
    container.innerHTML = '<h3>Audits Ratio</h3>';
    
    const size = Math.min(container.clientWidth, 300);
    const svg = createSVG(size, size);
    const center = size / 2;
    const radius = size / 2 - 20;
    
    const total = totalUp + totalDown || 1; // Prevent division by zero
    const upRatio = totalUp / total;
    
    // Calculate audit ratio CORRECTLY - ensure we're using the right formula
    // For an audit ratio of 1.4, we need to make sure we're calculating it the right way
    const auditRatio = totalUp > 0 && totalDown > 0 
        ? ((totalDown > totalUp) ? (totalDown / totalUp) : (totalUp / totalDown)).toFixed(1) 
        : '0.0';
        
    // For debug - remove later
    console.log('Audit ratio calculation:', {
        totalDown,
        totalUp,
        calculatedRatio: totalDown / totalUp,
        formattedRatio: auditRatio
    });
    
    // Calculate angles for the pie slices
    const upAngle = upRatio * 2 * Math.PI;
    
    // Create pie slices with modern colors
    const createSlice = (startAngle, endAngle, color) => {
        const x1 = center + radius * Math.cos(startAngle);
        const y1 = center + radius * Math.sin(startAngle);
        const x2 = center + radius * Math.cos(endAngle);
        const y2 = center + radius * Math.sin(endAngle);
        
        const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
        
        const d = [
            "M", center, center,
            "L", x1, y1,
            "A", radius, radius, 0, largeArcFlag, 1, x2, y2,
            "Z"
        ].join(" ");
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", color);
        
        // Add hover effect
        path.addEventListener('mouseover', () => {
            path.setAttribute('opacity', '0.8');
            path.style.cursor = 'pointer';
        });
        path.addEventListener('mouseout', () => {
            path.setAttribute('opacity', '1');
        });
        
        return path;
    };
    
    svg.appendChild(createSlice(0, upAngle, "#6366f1"));
    svg.appendChild(createSlice(upAngle, 2 * Math.PI, "#10b981"));
    
    // Add inner circle for donut effect
    const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    innerCircle.setAttribute("cx", center);
    innerCircle.setAttribute("cy", center);
    innerCircle.setAttribute("r", radius / 2);
    innerCircle.setAttribute("fill", "#ffffff");
    svg.appendChild(innerCircle);

    // Add audit ratio text in the center (instead of percentage)
    const ratioText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    ratioText.setAttribute("x", center);
    ratioText.setAttribute("y", center + 5); // Slight adjustment for vertical centering
    ratioText.setAttribute("text-anchor", "middle");
    ratioText.setAttribute("font-size", "24px");
    ratioText.setAttribute("font-weight", "bold");
    ratioText.setAttribute("fill", "#111827");
    ratioText.textContent = auditRatio; // Display audit ratio instead of percentage
    svg.appendChild(ratioText);
    
    // Add legend
    const legend = document.createElement('div');
    legend.style.display = 'flex';
    legend.style.justifyContent = 'center';
    legend.style.gap = '20px';
    legend.style.marginTop = '20px';
    legend.innerHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: block; width: 12px; height: 12px; background-color: #6366f1; border-radius: 2px;"></span>
            <span>Done: ${totalReceivedInMB} MB</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
            <span style="display: block; width: 12px; height: 12px; background-color: #10b981; border-radius: 2px;"></span>
            <span>Received: ${totalDoneInMB} MB</span>
        </div>
    `;
    
    container.appendChild(svg);
    container.appendChild(legend);
}

// Function to draw XP by Project bar chart
function drawXPByProjectGraph(transactions) {
    const container = document.getElementById('xpGraph');
    
    // Add null check
    if (!container) {
        console.warn('XP By Project Graph container not found in DOM');
        return;
    }
    
    container.innerHTML = '<h3>Top Projects by Points</h3>';
    
    const width = container.clientWidth - 40;
    const height = 350;
    const padding = { top: 40, right: 30, bottom: 100, left: 60 };

    // Filter and group XP by project
    const regex = /\/piscine-[^/]+\//; // Matches "/piscine-<anything>/" anywhere in the path

    const projectXP = transactions
        .filter(t => 
            t.type === 'xp' &&
            t.path.includes('bh-module') &&
            !regex.test(t.path))
        .reduce((acc, t) => {
            try {
                const pathParts = t.path.split('/');
                const projectName = pathParts[pathParts.length - 1]
                    .replace(/^project-/, '')
                    .replace(/-/g, ' ');
                acc[projectName] = (acc[projectName] || 0) + t.amount;
            } catch (error) {
                console.error('Error processing transaction:', error);
            }
            return acc;
        }, {});

    // Convert to array, sort by XP amount, and take top 10
    const projectData = Object.entries(projectXP)
        .map(([project, xp]) => ({ project, xp }))
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10); // Take only top 10 projects

    if (projectData.length === 0) {
        container.innerHTML += '<p>No project XP data available.</p>';
        return;
    }

    const svg = createSVG(width, height);
    
    // Calculate scales
    const maxXP = Math.max(...projectData.map(d => d.xp));
    const barWidth = Math.min(60, (width - padding.left - padding.right) / projectData.length - 10);
    const gap = 10;
    const yScale = (height - padding.top - padding.bottom) / maxXP;

    // Format XP value consistently with better rounding
    function formatXP(xp) {
        const kbValue = xp / 1000;
        let formatted;
        
        if (kbValue >= 1000) {
            // For values >= 100 kB, round to nearest whole number
            formatted = Math.round(kbValue).toString();
        } else if (kbValue >= 10) {
            // For values >= 10 kB, round to one decimal place
            formatted = kbValue.toFixed(1);
        } else {
            // For values < 10 kB, round to two decimal places
            formatted = kbValue.toFixed(2);
        }
        
        // Remove trailing zeros after decimal point
        formatted = formatted.replace(/\.?0+$/, '');
        
        return `${formatted} kB`;
    }

    // Add background grid
    for (let i = 0; i <= 5; i++) {
        const y = height - padding.bottom - (i * (height - padding.top - padding.bottom) / 5);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", padding.left);
        line.setAttribute("y1", y);
        line.setAttribute("x2", width - padding.right);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "#e5e7eb");
        line.setAttribute("stroke-width", "1");
        svg.appendChild(line);
    }
    
    // Create bars with gradient fill
    projectData.forEach((data, i) => {
        const barHeight = data.xp * yScale;
        const x = padding.left + i * (barWidth + gap);
        const y = height - padding.bottom - barHeight;
        
        // Create gradient
        const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        const gradientId = `barGradient-${i}`;
        gradient.setAttribute("id", gradientId);
        gradient.setAttribute("x1", "0");
        gradient.setAttribute("y1", "0");
        gradient.setAttribute("x2", "0");
        gradient.setAttribute("y2", "1");
        
        const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop1.setAttribute("offset", "0%");
        stop1.setAttribute("stop-color", "#6366f1");
        
        const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        stop2.setAttribute("offset", "100%");
        stop2.setAttribute("stop-color", "#4f46e5");
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.appendChild(gradient);
        svg.appendChild(defs);

        // Create bar
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", barWidth);
        rect.setAttribute("height", barHeight);
        rect.setAttribute("fill", `url(#${gradientId})`);
        rect.setAttribute("rx", "4");
        rect.setAttribute("ry", "4");

        // Add hover effect
        rect.addEventListener('mouseover', () => {
            rect.setAttribute("fill", "#4f46e5");
            tooltip.style.display = 'block';
            tooltip.style.left = `${x + barWidth/2}px`;
            tooltip.style.top = `${y - 20}px`;
            tooltip.textContent = `${data.project}: ${formatXP(data.xp)}`;
        });
        rect.addEventListener('mouseout', () => {
            rect.setAttribute("fill", `url(#${gradientId})`);
            tooltip.style.display = 'none';
        });

        svg.appendChild(rect);

        // Add project name label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x + barWidth / 2);
        text.setAttribute("y", height - padding.bottom + 20);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("transform", `rotate(-45, ${x + barWidth / 2}, ${height - padding.bottom + 20})`);
        text.setAttribute("fill", "#111827");
        text.setAttribute("font-size", "12px");
        text.textContent = data.project;
        svg.appendChild(text);
    });

    // Add Y-axis
    const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
    yAxis.setAttribute("x1", padding.left);
    yAxis.setAttribute("y1", padding.top);
    yAxis.setAttribute("x2", padding.left);
    yAxis.setAttribute("y2", height - padding.bottom);
    yAxis.setAttribute("stroke", "#6b7280");
    yAxis.setAttribute("stroke-width", "1");
    svg.appendChild(yAxis);

    // Add Y-axis labels
    for (let i = 0; i <= 5; i++) {
        const yValue = maxXP * i / 5;
        const yLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const yPos = height - padding.bottom - (i * (height - padding.top - padding.bottom) / 5);
        yLabel.setAttribute("x", padding.left - 10);
        yLabel.setAttribute("y", yPos);
        yLabel.setAttribute("text-anchor", "end");
        yLabel.setAttribute("alignment-baseline", "middle");
        yLabel.setAttribute("fill", "#6b7280");
        yLabel.setAttribute("font-size", "12px");
        yLabel.textContent = formatXP(yValue);
        svg.appendChild(yLabel);
    }

    // Create tooltip
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position: absolute;
        display: none;
        background: rgba(17, 24, 39, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        pointer-events: none;
        transform: translate(-50%, -100%);
        z-index: 10;
    `;

    container.style.position = 'relative';
    container.appendChild(svg);
    container.appendChild(tooltip);
    
    // Calculate and display total XP in user info instead of chart
    const totalXP = projectData.reduce((sum, d) => sum + d.xp, 0);
    
    // Don't show total here anymore since it's in the user info
}

// Main function to draw all graphs
async function drawGraphs(userData, totalXP) {
    try {
        // Only call each graph function if the container exists
        if (document.getElementById('auditGraph')) {
            drawAuditRatioPieChart(userData.totalUp, userData.totalDown);
        }
        
        if (document.getElementById('xpGraph') && userData.transactions) {
            drawXPByProjectGraph(userData.transactions);
        }
    } catch (error) {
        console.error('Error drawing graphs:', error);
    }
}
